const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Unified login (without MongoDB)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    // Mock admin login
    if (identifier === 'admin@test.com' && password === 'Admin@123456') {
      return res.json({
        token: 'mock_jwt_token_admin',
        role: 'admin',
        user: {
          id: 'mock_admin_id',
          email: 'admin@test.com',
          name: 'Test Admin',
          role: 'admin'
        }
      });
    }
    
    // Mock user login
    if (identifier === '+1234567890' && password === 'User@123456') {
      return res.json({
        token: 'mock_jwt_token_user',
        role: 'user',
        user: {
          id: 'mock_user_id',
          name: 'Test User',
          businessName: 'Test Shop',
          phone: '+1234567890',
          role: 'user'
        }
      });
    }
    
    res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Something went wrong!' });
  }
});

// Mock admin dashboard
app.get('/api/admin/dashboard', (req, res) => {
  res.json({
    stats: {
      totalUsers: 5,
      activeUsers: 3,
      trialUsers: 1,
      yearlyUsers: 2,
      lifetimeUsers: 0
    },
    recentUsers: [
      {
        _id: '1',
        businessName: 'Test Shop 1',
        phone: '+1234567890',
        subscriptionType: 'trial',
        isActive: true
      },
      {
        _id: '2',
        businessName: 'Test Shop 2',
        phone: '+0987654321',
        subscriptionType: 'yearly',
        isActive: true
      }
    ],
    expiringUsers: []
  });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Test admin credentials:`);
  console.log(`Email: admin@test.com`);
  console.log(`Password: Admin@123456`);
});
