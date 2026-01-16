const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const Stitching = require('../models/Stitching');
const Customer = require('../models/Customer');
const {
  generatePhase1TLV,
  generatePhase2TLV,
  generateInvoiceHash,
  generateUUID,
  formatZATCADate,
  calculateVAT,
  INVOICE_TYPES,
  INVOICE_SUBTYPES,
  generateZATCAXML,
  generateCSRConfig,
  ZATCA_ENDPOINTS
} = require('../utils/zatca');

// Get ZATCA settings for user
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('zatcaSettings businessName');
    res.json({
      settings: user.zatcaSettings || {},
      businessName: user.businessName
    });
  } catch (error) {
    console.error('Error fetching ZATCA settings:', error);
    res.status(500).json({ error: 'Failed to fetch ZATCA settings' });
  }
});

// Save ZATCA settings
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const {
      vatNumber,
      crn,
      street,
      buildingNumber,
      district,
      city,
      postalCode,
      plotId,
      phase,
      environment,
      invoiceCounter,
      previousInvoiceHash,
      csid,
      csidSecret,
      productionCsid,
      productionCsidSecret,
      otp,
      enabled,
      showOnInvoice
    } = req.body;

    const zatcaSettings = {
      vatNumber,
      crn,
      street,
      buildingNumber,
      district,
      city,
      postalCode,
      plotId,
      phase: phase || 1,
      environment: environment || 'sandbox',
      invoiceCounter: invoiceCounter || 0,
      previousInvoiceHash: previousInvoiceHash || null,
      csid,
      csidSecret,
      productionCsid,
      productionCsidSecret,
      otp,
      enabled: enabled || false,
      showOnInvoice: showOnInvoice || false,
      updatedAt: new Date()
    };

    await User.findByIdAndUpdate(req.user.id, { zatcaSettings });
    res.json({ message: 'ZATCA settings saved successfully', settings: zatcaSettings });
  } catch (error) {
    console.error('Error saving ZATCA settings:', error);
    res.status(500).json({ error: 'Failed to save ZATCA settings' });
  }
});

// Generate Phase 1 QR code data for an invoice
router.post('/generate-qr', authenticateToken, async (req, res) => {
  try {
    const { stitchingId, customInvoice } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user.zatcaSettings?.vatNumber) {
      return res.status(400).json({ error: 'ZATCA settings not configured. Please set VAT number.' });
    }

    let invoiceData;
    
    if (stitchingId) {
      const stitching = await Stitching.findById(stitchingId).populate('customer');
      if (!stitching) {
        return res.status(404).json({ error: 'Stitching order not found' });
      }
      
      const vatRate = 15;
      const totalWithoutVat = stitching.price / (1 + vatRate / 100);
      const vatAmount = stitching.price - totalWithoutVat;
      
      invoiceData = {
        sellerName: user.businessName || user.name,
        vatNumber: user.zatcaSettings.vatNumber,
        timestamp: formatZATCADate(stitching.createdAt),
        invoiceTotal: stitching.price.toFixed(2),
        vatTotal: vatAmount.toFixed(2)
      };
    } else if (customInvoice) {
      invoiceData = {
        sellerName: user.businessName || user.name,
        vatNumber: user.zatcaSettings.vatNumber,
        timestamp: formatZATCADate(new Date()),
        invoiceTotal: customInvoice.total.toFixed(2),
        vatTotal: customInvoice.vatAmount.toFixed(2)
      };
    } else {
      return res.status(400).json({ error: 'Either stitchingId or customInvoice is required' });
    }

    const qrData = generatePhase1TLV(invoiceData);
    
    res.json({
      qrData,
      invoiceData,
      phase: 1
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Generate Phase 2 XML invoice
router.post('/generate-xml', authenticateToken, async (req, res) => {
  try {
    const { stitchingId, invoiceType = 'SIMPLIFIED' } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user.zatcaSettings?.vatNumber) {
      return res.status(400).json({ error: 'ZATCA settings not configured' });
    }

    const stitching = await Stitching.findById(stitchingId).populate('customer');
    if (!stitching) {
      return res.status(404).json({ error: 'Stitching order not found' });
    }

    const settings = user.zatcaSettings;
    const vatRate = 15;
    const priceWithoutVat = Number((stitching.price / (1 + vatRate / 100)).toFixed(2));
    const vatAmount = Number((stitching.price - priceWithoutVat).toFixed(2));
    
    const invoiceCounter = (settings.invoiceCounter || 0) + 1;
    const uuid = generateUUID();
    const now = new Date();

    const invoiceData = {
      invoiceNumber: stitching.receiptNumber || `INV-${invoiceCounter}`,
      uuid,
      issueDate: now.toISOString().split('T')[0],
      issueTime: now.toISOString().split('T')[1].split('.')[0] + 'Z',
      invoiceType: INVOICE_TYPES[invoiceType],
      invoiceSubtype: INVOICE_SUBTYPES[invoiceType],
      currency: 'SAR',
      seller: {
        name: user.businessName || user.name,
        vatNumber: settings.vatNumber,
        crn: settings.crn || '',
        street: settings.street || '',
        buildingNumber: settings.buildingNumber || '',
        district: settings.district || '',
        city: settings.city || '',
        postalCode: settings.postalCode || '',
        plotId: settings.plotId || ''
      },
      buyer: invoiceType === 'STANDARD' && stitching.customer ? {
        name: stitching.customer.name,
        vatNumber: stitching.customer.vatNumber || '',
        street: stitching.customer.address || '',
        city: settings.city || '',
        country: 'SA'
      } : null,
      lineItems: [{
        name: stitching.description || 'Stitching Service',
        quantity: stitching.quantity || 1,
        unitPrice: priceWithoutVat,
        lineTotal: priceWithoutVat,
        taxAmount: vatAmount
      }],
      taxTotal: vatAmount,
      invoiceTotal: stitching.price,
      previousInvoiceHash: settings.previousInvoiceHash,
      invoiceCounter
    };

    const xml = generateZATCAXML(invoiceData, settings);
    const invoiceHash = generateInvoiceHash(xml);

    // Update invoice counter and previous hash
    await User.findByIdAndUpdate(req.user.id, {
      'zatcaSettings.invoiceCounter': invoiceCounter,
      'zatcaSettings.previousInvoiceHash': invoiceHash
    });

    res.json({
      xml,
      invoiceHash,
      uuid,
      invoiceNumber: invoiceData.invoiceNumber,
      invoiceCounter,
      phase: 2
    });
  } catch (error) {
    console.error('Error generating XML:', error);
    res.status(500).json({ error: 'Failed to generate XML invoice' });
  }
});

// Report invoice to ZATCA (Phase 2 - Simplified invoices)
router.post('/report-invoice', authenticateToken, async (req, res) => {
  try {
    const { invoiceXml, invoiceHash, uuid } = req.body;
    const user = await User.findById(req.user.id);
    const settings = user.zatcaSettings;

    if (!settings?.csid || !settings?.csidSecret) {
      return res.status(400).json({ error: 'CSID credentials not configured. Please complete onboarding first.' });
    }

    const environment = settings.environment || 'sandbox';
    const endpoint = ZATCA_ENDPOINTS[environment.toUpperCase()]?.REPORTING;

    if (!endpoint) {
      return res.status(400).json({ error: 'Invalid environment configuration' });
    }

    const credentials = Buffer.from(`${settings.csid}:${settings.csidSecret}`).toString('base64');
    
    const requestBody = {
      invoiceHash,
      uuid,
      invoice: Buffer.from(invoiceXml).toString('base64')
    };

    // Make API call to ZATCA
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': 'en',
        'Accept-Version': 'V2',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify(requestBody)
    });

    const result = await response.json();

    // Store invoice record
    await Stitching.findOneAndUpdate(
      { receiptNumber: req.body.receiptNumber },
      {
        zatcaStatus: response.ok ? 'REPORTED' : 'FAILED',
        zatcaResponse: result,
        zatcaReportedAt: new Date()
      }
    );

    if (response.ok) {
      res.json({
        success: true,
        message: 'Invoice reported successfully',
        result
      });
    } else {
      res.status(response.status).json({
        success: false,
        message: 'Invoice reporting failed',
        result
      });
    }
  } catch (error) {
    console.error('Error reporting invoice:', error);
    res.status(500).json({ error: 'Failed to report invoice to ZATCA' });
  }
});

// Clear invoice with ZATCA (Phase 2 - Standard B2B invoices)
router.post('/clear-invoice', authenticateToken, async (req, res) => {
  try {
    const { invoiceXml, invoiceHash, uuid } = req.body;
    const user = await User.findById(req.user.id);
    const settings = user.zatcaSettings;

    if (!settings?.productionCsid || !settings?.productionCsidSecret) {
      return res.status(400).json({ error: 'Production CSID not configured. Please complete production onboarding.' });
    }

    const environment = settings.environment || 'sandbox';
    const endpoint = ZATCA_ENDPOINTS[environment.toUpperCase()]?.CLEARANCE;

    const credentials = Buffer.from(`${settings.productionCsid}:${settings.productionCsidSecret}`).toString('base64');
    
    const requestBody = {
      invoiceHash,
      uuid,
      invoice: Buffer.from(invoiceXml).toString('base64')
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': 'en',
        'Accept-Version': 'V2',
        'Authorization': `Basic ${credentials}`,
        'Clearance-Status': '1'
      },
      body: JSON.stringify(requestBody)
    });

    const result = await response.json();

    if (response.ok) {
      res.json({
        success: true,
        message: 'Invoice cleared successfully',
        result,
        clearedInvoice: result.clearedInvoice ? Buffer.from(result.clearedInvoice, 'base64').toString() : null
      });
    } else {
      res.status(response.status).json({
        success: false,
        message: 'Invoice clearance failed',
        result
      });
    }
  } catch (error) {
    console.error('Error clearing invoice:', error);
    res.status(500).json({ error: 'Failed to clear invoice with ZATCA' });
  }
});

// Onboarding - Get Compliance CSID
router.post('/onboarding/compliance-csid', authenticateToken, async (req, res) => {
  try {
    const { csr, otp } = req.body;
    const user = await User.findById(req.user.id);
    const settings = user.zatcaSettings || {};
    
    const environment = settings.environment || 'sandbox';
    const endpoint = ZATCA_ENDPOINTS[environment.toUpperCase()]?.COMPLIANCE_CSID;

    const requestBody = { csr };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Version': 'V2',
        'OTP': otp
      },
      body: JSON.stringify(requestBody)
    });

    const result = await response.json();

    if (response.ok && result.binarySecurityToken && result.secret) {
      await User.findByIdAndUpdate(req.user.id, {
        'zatcaSettings.csid': result.binarySecurityToken,
        'zatcaSettings.csidSecret': result.secret,
        'zatcaSettings.onboardingStatus': 'COMPLIANCE_CSID_OBTAINED'
      });

      res.json({
        success: true,
        message: 'Compliance CSID obtained successfully',
        csid: result.binarySecurityToken
      });
    } else {
      res.status(response.status || 400).json({
        success: false,
        message: 'Failed to obtain Compliance CSID',
        result
      });
    }
  } catch (error) {
    console.error('Error getting compliance CSID:', error);
    res.status(500).json({ error: 'Failed to get compliance CSID' });
  }
});

// Onboarding - Get Production CSID
router.post('/onboarding/production-csid', authenticateToken, async (req, res) => {
  try {
    const { complianceRequestId } = req.body;
    const user = await User.findById(req.user.id);
    const settings = user.zatcaSettings;

    if (!settings?.csid || !settings?.csidSecret) {
      return res.status(400).json({ error: 'Compliance CSID required first' });
    }

    const environment = settings.environment || 'sandbox';
    const endpoint = ZATCA_ENDPOINTS[environment.toUpperCase()]?.PRODUCTION_CSID;

    const credentials = Buffer.from(`${settings.csid}:${settings.csidSecret}`).toString('base64');
    
    const requestBody = { compliance_request_id: complianceRequestId };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Version': 'V2',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify(requestBody)
    });

    const result = await response.json();

    if (response.ok && result.binarySecurityToken && result.secret) {
      await User.findByIdAndUpdate(req.user.id, {
        'zatcaSettings.productionCsid': result.binarySecurityToken,
        'zatcaSettings.productionCsidSecret': result.secret,
        'zatcaSettings.onboardingStatus': 'PRODUCTION_READY',
        'zatcaSettings.phase': 2
      });

      res.json({
        success: true,
        message: 'Production CSID obtained successfully. You are now ready for Phase 2!',
        csid: result.binarySecurityToken
      });
    } else {
      res.status(response.status || 400).json({
        success: false,
        message: 'Failed to obtain Production CSID',
        result
      });
    }
  } catch (error) {
    console.error('Error getting production CSID:', error);
    res.status(500).json({ error: 'Failed to get production CSID' });
  }
});

// Get invoice history with ZATCA status
router.get('/invoices', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const stitchings = await Stitching.find({ 
      user: req.user.id,
      zatcaStatus: { $exists: true }
    })
    .populate('customer', 'name phone')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

    const total = await Stitching.countDocuments({ 
      user: req.user.id,
      zatcaStatus: { $exists: true }
    });

    res.json({
      invoices: stitchings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Generate CSR configuration
router.post('/generate-csr-config', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const settings = user.zatcaSettings || {};
    
    const csrConfig = generateCSRConfig({
      businessName: user.businessName || user.name,
      vatNumber: settings.vatNumber,
      unitName: settings.unitName || 'Main Branch',
      city: settings.city,
      businessCategory: settings.businessCategory || 'Tailoring'
    });

    res.json({ csrConfig });
  } catch (error) {
    console.error('Error generating CSR config:', error);
    res.status(500).json({ error: 'Failed to generate CSR configuration' });
  }
});

module.exports = router;
