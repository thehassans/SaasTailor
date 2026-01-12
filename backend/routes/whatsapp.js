const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken, isUser } = require('../middleware/auth');
const whatsappService = require('../utils/whatsappService');

router.use(verifyToken, isUser);

// Get WhatsApp status
router.get('/status', async (req, res) => {
  try {
    const status = whatsappService.getStatus(req.user._id.toString());
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Initialize WhatsApp connection
router.post('/connect', async (req, res) => {
  try {
    let qrCode = null;
    
    const result = await whatsappService.initWhatsApp(
      req.user._id.toString(),
      (qr) => { qrCode = qr; },
      async () => {
        req.user.whatsappEnabled = true;
        await req.user.save();
      },
      async () => {
        req.user.whatsappEnabled = false;
        await req.user.save();
      }
    );
    
    // Wait a bit for QR code generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    res.json({ 
      ...result,
      qrCode 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Disconnect WhatsApp
router.post('/disconnect', async (req, res) => {
  try {
    const result = await whatsappService.disconnect(req.user._id.toString());
    
    req.user.whatsappEnabled = false;
    await req.user.save();
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Send message
router.post('/send', async (req, res) => {
  try {
    const { phone, message } = req.body;
    
    if (!phone || !message) {
      return res.status(400).json({ error: 'Phone and message are required' });
    }
    
    const result = await whatsappService.sendMessage(
      req.user._id.toString(),
      phone,
      message
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Send order notification
router.post('/notify/order', async (req, res) => {
  try {
    const { phone, customerName, receiptNumber, amount, dueDate } = req.body;
    
    const message = `Dear ${customerName},\n\nYour order has been received!\n\nReceipt: ${receiptNumber}\nAmount: ${amount}\n${dueDate ? `Expected: ${dueDate}` : ''}\n\nThank you for choosing ${req.user.businessName}!`;
    
    const result = await whatsappService.sendMessage(
      req.user._id.toString(),
      phone,
      message
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Send ready notification
router.post('/notify/ready', async (req, res) => {
  try {
    const { phone, customerName, receiptNumber } = req.body;
    
    const message = `Dear ${customerName},\n\nGreat news! Your order (${receiptNumber}) is ready for pickup.\n\nPlease visit us at your convenience.\n\nThank you!\n${req.user.businessName}`;
    
    const result = await whatsappService.sendMessage(
      req.user._id.toString(),
      phone,
      message
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
