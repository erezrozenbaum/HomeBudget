// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { sequelize } = require('./models');
const routes = require('./routes');
const processRecurringTransactions = require('./scripts/processRecurringTransactions');
const seedDefaultCategories = require('./scripts/seedDefaultCategories');

const app = express();

// CORS configuration
const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5177'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.CORS_ORIGIN === origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

// Function to try binding to a port
const tryPort = async (port) => {
  return new Promise((resolve) => {
    const server = app.listen(port)
      .once('error', () => {
        server.close();
        resolve(false);
      })
      .once('listening', () => {
        resolve(true);
      });
  });
};

// Start server with port finding
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync database models
    await sequelize.sync();
    console.log('Database models synchronized.');

    // Try ports starting from the preferred port
    const startPort = parseInt(process.env.PORT || '3001');
    const maxPort = startPort + 10; // Try up to 10 ports

    for (let port = startPort; port <= maxPort; port++) {
      console.log(`Attempting to start server on port ${port}...`);
      const success = await tryPort(port);
      if (success) {
        console.log(`Server running on port ${port}`);
        break;
      }
      if (port === maxPort) {
        throw new Error('Could not find an available port');
      }
    }

    // Schedule recurring transaction processing
    if (process.env.NODE_ENV !== 'test') {
      // Process recurring transactions every hour
      setInterval(processRecurringTransactions, 60 * 60 * 1000);
      // Also process immediately on startup
      processRecurringTransactions();
    }
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer(); 