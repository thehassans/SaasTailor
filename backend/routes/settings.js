const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken, isUser } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(verifyToken, isUser);

// Get settings
router.get('/', async (req, res) => {
  try {
    res.json({
      settings: {
        businessName: req.user.businessName,
        logo: req.user.logo,
        language: req.user.language,
        receiptPrefix: req.user.receiptPrefix,
        receiptCounter: req.user.receiptCounter,
        whatsappEnabled: req.user.whatsappEnabled
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update settings
router.put('/', upload.single('logo'), async (req, res) => {
  try {
    const { language, receiptPrefix } = req.body;
    
    if (language) req.user.language = language;
    if (receiptPrefix) req.user.receiptPrefix = receiptPrefix;
    if (req.file) req.user.logo = `/uploads/${req.file.filename}`;
    
    await req.user.save();
    
    res.json({ 
      message: 'Settings updated successfully',
      settings: {
        businessName: req.user.businessName,
        logo: req.user.logo,
        language: req.user.language,
        receiptPrefix: req.user.receiptPrefix,
        receiptCounter: req.user.receiptCounter,
        whatsappEnabled: req.user.whatsappEnabled
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update receipt settings
router.put('/receipt', async (req, res) => {
  try {
    const { receiptPrefix, receiptCounter } = req.body;
    
    if (receiptPrefix) req.user.receiptPrefix = receiptPrefix;
    if (receiptCounter) req.user.receiptCounter = receiptCounter;
    
    await req.user.save();
    
    res.json({ 
      message: 'Receipt settings updated',
      receiptPrefix: req.user.receiptPrefix,
      receiptCounter: req.user.receiptCounter
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
