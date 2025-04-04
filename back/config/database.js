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
        projectId INTEGER, -- Added link to Projects table
        filePath TEXT,
        fileName TEXT,
        fileType TEXT,
        fileSize INTEGER,
        extractedText TEXT,
        summary TEXT, -- Added column for AI-generated summary
        uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY(projectId) REFERENCES Projects(id) ON DELETE CASCADE -- Added FK constraint
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
        type TEXT, -- Added project type (e.g., 'divorce', 'contract')
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

    // Create Conversations table for quick AI assistance
    db.run(`
      CREATE TABLE IF NOT EXISTS Conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        title TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        lastSuggestedQuestions TEXT, -- Added column for suggestions
        FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE
      )
    `);

    // Create Chats table with support for both project and conversation associations
    db.run(`
      CREATE TABLE IF NOT EXISTS Chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        projectId INTEGER,
        conversationId INTEGER,
        title TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        lastSuggestedQuestions TEXT, -- Added column for suggestions
        FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY(projectId) REFERENCES Projects(id) ON DELETE CASCADE,
        FOREIGN KEY(conversationId) REFERENCES Conversations(id) ON DELETE CASCADE,
        CHECK ((projectId IS NULL AND conversationId IS NOT NULL) OR (projectId IS NOT NULL AND conversationId IS NULL))
      )
    `);

    // Create Messages table
    db.run(`
      CREATE TABLE IF NOT EXISTS Messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chatId INTEGER NOT NULL,
        sender TEXT CHECK(sender IN ('user', 'ai')) NOT NULL,
        content TEXT NOT NULL,
        tokensUsed INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP, -- Added for tracking edits
        FOREIGN KEY(chatId) REFERENCES Chats(id) ON DELETE CASCADE
      )
    `);
    
    // Create LegalRequestDocuments table
    db.run(`
      CREATE TABLE IF NOT EXISTS LegalRequestDocuments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        legalRequestId INTEGER NOT NULL,
        filePath TEXT NOT NULL,
        fileName TEXT NOT NULL,
        fileType TEXT NOT NULL,
        fileSize INTEGER NOT NULL,
        extractedText TEXT,
        summary TEXT,
        uploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES Users(id),
        FOREIGN KEY (legalRequestId) REFERENCES LegalRequests(id) ON DELETE CASCADE
      )
    `);
    
    // Create LegalRequestComments table
    db.run(`
      CREATE TABLE IF NOT EXISTS LegalRequestComments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        legalRequestId INTEGER NOT NULL,
        content TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (legalRequestId) REFERENCES LegalRequests(id) ON DELETE CASCADE
      )
    `);

    // Create ClientSubscriptions table
    db.run(`
      CREATE TABLE IF NOT EXISTS ClientSubscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        planId INTEGER NOT NULL,
        status TEXT CHECK(status IN ('active', 'cancelled', 'pending_payment', 'expired', 'trial', 'pending_cancellation')) NOT NULL DEFAULT 'pending_payment',
        startDate DATETIME,
        endDate DATETIME,
        paymentProvider TEXT, -- e.g., 'stripe', 'paypal'
        paymentSubscriptionId TEXT, -- ID from the payment provider
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY(planId) REFERENCES SubscriptionPlans(id) ON DELETE RESTRICT -- Prevent deleting plans in use
      )
    `);

    // Trigger to update Chats.updatedAt when a new message is inserted
    db.run(`
      CREATE TRIGGER IF NOT EXISTS update_chat_timestamp
      AFTER INSERT ON Messages
      FOR EACH ROW
      BEGIN
        UPDATE Chats SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.chatId;
      END;
    `);

    // Trigger to update Messages.updatedAt when content is updated
    db.run(`
      CREATE TRIGGER IF NOT EXISTS update_message_timestamp
      AFTER UPDATE OF content ON Messages
      FOR EACH ROW
      WHEN OLD.content IS NOT NEW.content -- Only run if content actually changed
      BEGIN
        UPDATE Messages SET updatedAt = CURRENT_TIMESTAMP WHERE id = OLD.id;
      END;
    `);

    // Trigger to update ClientSubscriptions.updatedAt
    db.run(`
      CREATE TRIGGER IF NOT EXISTS update_client_subscription_timestamp
      AFTER UPDATE ON ClientSubscriptions
      FOR EACH ROW
      BEGIN
        UPDATE ClientSubscriptions SET updatedAt = CURRENT_TIMESTAMP WHERE id = OLD.id;
      END;
    `);

    // Create ForumTopics table
    db.run(`
      CREATE TABLE IF NOT EXISTS ForumTopics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lawyerId INTEGER NOT NULL, -- User who created the topic (must be lawyer)
        title TEXT NOT NULL,
        category TEXT, -- Optional category
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        lastActivityAt DATETIME DEFAULT CURRENT_TIMESTAMP, -- For sorting
        FOREIGN KEY(lawyerId) REFERENCES Users(id) ON DELETE CASCADE
      )
    `);

    // Create ForumPosts table
    db.run(`
      CREATE TABLE IF NOT EXISTS ForumPosts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topicId INTEGER NOT NULL,
        lawyerId INTEGER NOT NULL, -- User who wrote the post (must be lawyer)
        content TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(topicId) REFERENCES ForumTopics(id) ON DELETE CASCADE,
        FOREIGN KEY(lawyerId) REFERENCES Users(id) ON DELETE CASCADE
      )
    `);

    // Trigger to update ForumTopics.lastActivityAt when a new post is inserted
    db.run(`
      CREATE TRIGGER IF NOT EXISTS update_forum_topic_activity
      AFTER INSERT ON ForumPosts
      FOR EACH ROW
      BEGIN
        UPDATE ForumTopics SET lastActivityAt = CURRENT_TIMESTAMP WHERE id = NEW.topicId;
      END;
    `);

    // Create DirectMessages table for lawyer-to-lawyer chat
    db.run(`
      CREATE TABLE IF NOT EXISTS DirectMessages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        senderId INTEGER NOT NULL,
        receiverId INTEGER NOT NULL,
        content TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        readAt DATETIME NULL, -- Timestamp when the message was read
        FOREIGN KEY(senderId) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY(receiverId) REFERENCES Users(id) ON DELETE CASCADE
      )
    `);
// Create CalendarEvents table for lawyer personal calendar
db.run(`
  CREATE TABLE IF NOT EXISTS CalendarEvents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lawyerId INTEGER NOT NULL, -- Link to the lawyer user
    title TEXT NOT NULL,
    start DATETIME NOT NULL, -- ISO 8601 format recommended (YYYY-MM-DDTHH:MM:SS)
    end DATETIME,            -- Optional end time
    allDay BOOLEAN DEFAULT 0,
    description TEXT,
    location TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(lawyerId) REFERENCES Users(id) ON DELETE CASCADE
  )
`);

// Trigger to update CalendarEvents.updatedAt
db.run(`
  CREATE TRIGGER IF NOT EXISTS update_calendar_event_timestamp
  AFTER UPDATE ON CalendarEvents
  FOR EACH ROW
  BEGIN
    UPDATE CalendarEvents SET updatedAt = CURRENT_TIMESTAMP WHERE id = OLD.id;
  END;
`);
    // Create Contacts table for lawyer personal contact book
    db.run(`
      CREATE TABLE IF NOT EXISTS Contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lawyerId INTEGER NOT NULL, -- The lawyer who owns this contact
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        company TEXT,
        notes TEXT,
        isClient BOOLEAN DEFAULT 0, -- Flag if the contact is also a client user in the system
        clientId INTEGER NULL,     -- Optional link to Users table if isClient is true
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(lawyerId) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY(clientId) REFERENCES Users(id) ON DELETE SET NULL -- Link to client user if applicable
      )
    `);

     // Trigger to update Contacts.updatedAt
    db.run(`
      CREATE TRIGGER IF NOT EXISTS update_contact_timestamp
      AFTER UPDATE ON Contacts
      FOR EACH ROW
      BEGIN
        UPDATE Contacts SET updatedAt = CURRENT_TIMESTAMP WHERE id = OLD.id;
      END;
    `);

    // Create LegalNewsItems table
    db.run(`
      CREATE TABLE IF NOT EXISTS LegalNewsItems (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        link TEXT UNIQUE NOT NULL, -- Use link as unique identifier to avoid duplicates
        source TEXT,             -- Name of the RSS feed source
        pubDate DATETIME,          -- Publication date from the feed
        description TEXT,        -- Snippet or description from the feed
        fetchedAt DATETIME DEFAULT CURRENT_TIMESTAMP -- When we fetched it
      )
    `);
    // Add index for faster querying by date
    db.run(`CREATE INDEX IF NOT EXISTS idx_legalnewsitems_pubdate ON LegalNewsItems (pubDate DESC)`);
    // Create LawyerTemplates table for custom lawyer templates
    db.run(`
      CREATE TABLE IF NOT EXISTS LawyerTemplates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lawyerId INTEGER NOT NULL, -- The lawyer who owns this template
        name TEXT NOT NULL,        -- Template name/title
        description TEXT,
        category TEXT,             -- Optional category
        content TEXT NOT NULL,     -- The template content with placeholders like {variableName} or [variableName]
        variables TEXT,            -- JSON array of variable names used, e.g., '["clientName", "caseNumber"]'
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(lawyerId) REFERENCES Users(id) ON DELETE CASCADE
      )
    `);

    // Trigger to update LawyerTemplates.updatedAt
    db.run(`
      CREATE TRIGGER IF NOT EXISTS update_lawyer_template_timestamp
      AFTER UPDATE ON LawyerTemplates
      FOR EACH ROW
      BEGIN
        UPDATE LawyerTemplates SET updatedAt = CURRENT_TIMESTAMP WHERE id = OLD.id;
      END;
    `);

    // Create projects_lawyer table for lawyer-specific personal projects/dossiers
    db.run(`
      CREATE TABLE IF NOT EXISTS projects_lawyer (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lawyerId INTEGER NOT NULL, -- Link to the lawyer user
        title TEXT NOT NULL,
        description TEXT,
        type TEXT, -- Domain type (e.g., 'Droit de la famille', 'Recherche')
        status TEXT DEFAULT 'Ouvert', -- e.g., 'Ouvert', 'En cours', 'Fermé', 'Urgent'
        projectClientId INTEGER NULL, -- Link to the client associated with this project (if any)
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(lawyerId) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY(projectClientId) REFERENCES project_clients(id) ON DELETE SET NULL -- Allow project to exist without client, or client deletion
      )
    `);

    // Trigger to update projects_lawyer.updatedAt
    db.run(`
      CREATE TRIGGER IF NOT EXISTS update_projects_lawyer_timestamp
      AFTER UPDATE ON projects_lawyer
      FOR EACH ROW
      BEGIN
        UPDATE projects_lawyer SET updatedAt = CURRENT_TIMESTAMP WHERE id = OLD.id;
      END;
    `);

    // Create project_clients table to store client info linked to lawyer projects
    db.run(`
      CREATE TABLE IF NOT EXISTS project_clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lawyerId INTEGER NOT NULL, -- Lawyer who added this client info
        firstName TEXT,
        lastName TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        companyName TEXT, -- Optional company name
        notes TEXT,       -- General notes about the client
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(lawyerId) REFERENCES Users(id) ON DELETE CASCADE -- Link client record to the lawyer
      )
    `);

    // Trigger to update project_clients.updatedAt
    db.run(`
      CREATE TRIGGER IF NOT EXISTS update_project_clients_timestamp
      AFTER UPDATE ON project_clients
      FOR EACH ROW
      BEGIN
        UPDATE project_clients SET updatedAt = CURRENT_TIMESTAMP WHERE id = OLD.id;
      END;
    `);

    // Create lawyer_tasks table
    db.run(`
      CREATE TABLE IF NOT EXISTS lawyer_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projectId INTEGER NOT NULL, -- Link to the lawyer project
        lawyerId INTEGER NOT NULL, -- Link to the lawyer (for authorization)
        text TEXT NOT NULL,
        completed BOOLEAN DEFAULT 0,
        dueDate DATETIME NULL, -- Optional due date
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(projectId) REFERENCES projects_lawyer(id) ON DELETE CASCADE, -- Delete tasks if project is deleted
        FOREIGN KEY(lawyerId) REFERENCES Users(id) ON DELETE CASCADE
      )
    `);

    // Trigger to update lawyer_tasks.updatedAt
    db.run(`
      CREATE TRIGGER IF NOT EXISTS update_lawyer_tasks_timestamp
      AFTER UPDATE ON lawyer_tasks
      FOR EACH ROW
      BEGIN
        UPDATE lawyer_tasks SET updatedAt = CURRENT_TIMESTAMP WHERE id = OLD.id;
      END;
    `);

// Insert default subscription plans if they don't exist

// Insert default subscription plans if they don't exist
// Insert default subscription plans if they don't exist
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
            process.env.OPENROUTER_API_KEY || 'sk-or-v1-xxxxxxxxxxxxxxxxx',
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

    // Create admin user if it doesn't exist
    db.get('SELECT COUNT(*) as count FROM Users WHERE role = ?', ['client'], (err, result) => {
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
          ['Admin', 'client@avocatassist.com', hashedPassword, 'client', 9999],
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
    
    // Create admin user if it doesn't exist
    db.get('SELECT COUNT(*) as count FROM Users WHERE role = ?', ['lawyer'], (err, result) => {
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
          ['Admin', 'lawyer@avocatassist.com', hashedPassword, 'lawyer', 9999],
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

     // Create admin user if it doesn't exist
     db.get('SELECT COUNT(*) as count FROM Users WHERE role = ?', ['support'], (err, result) => {
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
          ['Admin', 'support@avocatassist.com', hashedPassword, 'support', 9999],
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
