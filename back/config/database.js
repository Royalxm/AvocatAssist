const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

// Database path
const dbPath = process.env.DB_PATH || './legal_saas.db';

// Create database directory if it doesn't exist
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Initialize database tables
const initializeDatabase = () => {
  db.serialize(() => {
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');
    
    // Create Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('client','lawyer','support','manager')) NOT NULL,
        creditBalance INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create LawyerProfiles table
    db.run(`
      CREATE TABLE IF NOT EXISTS LawyerProfiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER UNIQUE,
        specialties TEXT,
        experience TEXT,
        baseRate INTEGER,
        subscriptionPlan TEXT,
        tokenBalance INTEGER DEFAULT 0,
        FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE
      )
    `);
    
    // Create Documents table
    db.run(`
      CREATE TABLE IF NOT EXISTS Documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        filePath TEXT,
        fileName TEXT,
        fileType TEXT,
        fileSize INTEGER,
        extractedText TEXT,
        uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE
      )
    `);
    
    // Create Queries table
    db.run(`
      CREATE TABLE IF NOT EXISTS Queries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        question TEXT,
        response TEXT,
        tokensUsed INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE
      )
    `);
    
    // Create CreditTransactions table
    db.run(`
      CREATE TABLE IF NOT EXISTS CreditTransactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        amount INTEGER,
        transactionType TEXT,
        description TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE
      )
    `);
    
    // Create Projects table
    db.run(`
      CREATE TABLE IF NOT EXISTS Projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        title TEXT,
        description TEXT,
        status TEXT DEFAULT 'active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE
      )
    `);
    
    // Create LegalRequests table
    db.run(`
      CREATE TABLE IF NOT EXISTS LegalRequests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        clientId INTEGER,
        projectId INTEGER,
        title TEXT,
        description TEXT,
        summaryAI TEXT,
        status TEXT DEFAULT 'ouverte',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(clientId) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY(projectId) REFERENCES Projects(id) ON DELETE SET NULL
      )
    `);
    
    // Create Proposals table
    db.run(`
      CREATE TABLE IF NOT EXISTS Proposals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        requestId INTEGER,
        lawyerId INTEGER,
        proposalText TEXT,
        price INTEGER,
        estimatedDuration TEXT,
        status TEXT DEFAULT 'en attente',
        submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(requestId) REFERENCES LegalRequests(id) ON DELETE CASCADE,
        FOREIGN KEY(lawyerId) REFERENCES Users(id) ON DELETE CASCADE
      )
    `);
    
    // Create Transactions table
    db.run(`
      CREATE TABLE IF NOT EXISTS Transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        proposalId INTEGER,
        clientId INTEGER,
        lawyerId INTEGER,
        amount INTEGER,
        commission INTEGER,
        status TEXT DEFAULT 'completed',
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(proposalId) REFERENCES Proposals(id) ON DELETE SET NULL,
        FOREIGN KEY(clientId) REFERENCES Users(id) ON DELETE SET NULL,
        FOREIGN KEY(lawyerId) REFERENCES Users(id) ON DELETE SET NULL
      )
    `);
    
    // Create SubscriptionPlans table
    db.run(`
      CREATE TABLE IF NOT EXISTS SubscriptionPlans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        price REAL,
        tokenLimit INTEGER,
        features TEXT,
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create UserSubscriptions table
    db.run(`
      CREATE TABLE IF NOT EXISTS UserSubscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        planId INTEGER,
        startDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        endDate DATETIME,
        status TEXT DEFAULT 'active',
        FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY(planId) REFERENCES SubscriptionPlans(id) ON DELETE SET NULL
      )
    `);
    
    // Create APISettings table
    db.run(`
      CREATE TABLE IF NOT EXISTS APISettings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        provider TEXT,
        apiKey TEXT,
        endpointUrl TEXT,
        modelName TEXT,
        isDefault BOOLEAN DEFAULT 0,
        lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert default subscription plans if they don't exist
    db.get('SELECT COUNT(*) as count FROM SubscriptionPlans', (err, result) => {
      if (err) {
        console.error('Error checking subscription plans:', err.message);
        return;
      }
      
      if (result.count === 0) {
        // Insert default subscription plans
        const plans = [
          {
            name: 'Gratuit',
            price: 0,
            tokenLimit: 100,
            features: JSON.stringify([
              'Accès à l\'assistant IA (limité)',
              'Upload de documents (max 5)',
              'Création de demandes juridiques (max 2)'
            ])
          },
          {
            name: 'Standard',
            price: 19.99,
            tokenLimit: 2000,
            features: JSON.stringify([
              'Accès à l\'assistant IA',
              'Upload de documents illimité',
              'Création de demandes juridiques illimitées',
              'Modèles de documents juridiques'
            ])
          },
          {
            name: 'Premium',
            price: 49.99,
            tokenLimit: -1, // Unlimited
            features: JSON.stringify([
              'Tout ce qui est inclus dans le plan Standard',
              'Jetons illimités pour l\'IA',
              'Mises à jour en temps réel des lois',
              'Support prioritaire',
              'Accès à des avocats spécialisés'
            ])
          }
        ];
        
        const insertPlan = db.prepare('INSERT INTO SubscriptionPlans (name, price, tokenLimit, features) VALUES (?, ?, ?, ?)');
        
        plans.forEach(plan => {
          insertPlan.run(plan.name, plan.price, plan.tokenLimit, plan.features);
        });
        
        insertPlan.finalize();
        
        console.log('Default subscription plans inserted');
      }
    });
    
    // Insert default API settings if they don't exist
    db.get('SELECT COUNT(*) as count FROM APISettings', (err, result) => {
      if (err) {
        console.error('Error checking API settings:', err.message);
        return;
      }
      
      if (result.count === 0) {
        // Insert default API settings
        db.run(
          'INSERT INTO APISettings (provider, apiKey, endpointUrl, modelName, isDefault) VALUES (?, ?, ?, ?, ?)',
          [
            'openrouter',
            process.env.OPENROUTER_API_KEY || 'your_openrouter_api_key',
            process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions',
            process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo',
            1
          ],
          function(err) {
            if (err) {
              console.error('Error inserting default API settings:', err.message);
            } else {
              console.log('Default API settings inserted');
            }
          }
        );
      }
    });
    
    // Create admin user if it doesn't exist
    db.get('SELECT COUNT(*) as count FROM Users WHERE role = ?', ['manager'], (err, result) => {
      if (err) {
        console.error('Error checking admin user:', err.message);
        return;
      }
      
      if (result.count === 0) {
        // Hash password (in a real app, use bcrypt)
        const bcrypt = require('bcryptjs');
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync('admin123', salt);
        
        // Insert admin user
        db.run(
          'INSERT INTO Users (name, email, password, role, creditBalance) VALUES (?, ?, ?, ?, ?)',
          ['Admin', 'admin@avocatassist.com', hashedPassword, 'manager', 9999],
          function(err) {
            if (err) {
              console.error('Error inserting admin user:', err.message);
            } else {
              console.log('Admin user created');
            }
          }
        );
      }
    });
  });
};

module.exports = {
  db,
  initializeDatabase
};
