#!/bin/bash

# Script to initialize the AvocatAssist project structure

echo "Initializing AvocatAssist project structure..."

# Create main directories
mkdir -p back/config
mkdir -p back/controllers
mkdir -p back/middleware
mkdir -p back/models
mkdir -p back/routes
mkdir -p back/utils
mkdir -p back/data
mkdir -p back/uploads
mkdir -p back/scripts

mkdir -p front/public
mkdir -p front/src/assets
mkdir -p front/src/components
mkdir -p front/src/contexts
mkdir -p front/src/hooks
mkdir -p front/src/layouts
mkdir -p front/src/pages/admin
mkdir -p front/src/pages/client
mkdir -p front/src/pages/lawyer
mkdir -p front/src/pages/public
mkdir -p front/src/utils

# Create placeholder files to ensure git tracks empty directories
touch back/uploads/.gitkeep
touch front/src/assets/.gitkeep
touch front/src/components/.gitkeep
touch front/src/hooks/.gitkeep
touch front/src/utils/.gitkeep

# Create placeholder files for client pages
touch front/src/pages/client/Dashboard.js
touch front/src/pages/client/Profile.js
touch front/src/pages/client/Documents.js
touch front/src/pages/client/LegalRequests.js
touch front/src/pages/client/Proposals.js
touch front/src/pages/client/Transactions.js
touch front/src/pages/client/Subscription.js
touch front/src/pages/client/AiAssistant.js
touch front/src/pages/client/Templates.js

# Create placeholder files for lawyer pages
touch front/src/pages/lawyer/Dashboard.js
touch front/src/pages/lawyer/Profile.js
touch front/src/pages/lawyer/LegalRequests.js
touch front/src/pages/lawyer/Proposals.js
touch front/src/pages/lawyer/Transactions.js
touch front/src/pages/lawyer/Subscription.js
touch front/src/pages/lawyer/AiAssistant.js

# Create placeholder files for admin pages
touch front/src/pages/admin/Dashboard.js
touch front/src/pages/admin/Users.js
touch front/src/pages/admin/LegalRequests.js
touch front/src/pages/admin/Proposals.js
touch front/src/pages/admin/Transactions.js
touch front/src/pages/admin/Subscriptions.js
touch front/src/pages/admin/ApiSettings.js
touch front/src/pages/admin/Templates.js

# Create database initialization script
cat > back/scripts/init-db.js << 'EOF'
/**
 * Database initialization script
 * Run this script to create the database schema and seed initial data
 */
const { db, initializeDatabase } = require('../config/database');

console.log('Initializing database...');
initializeDatabase();
console.log('Database initialization complete!');
EOF

echo "Project structure initialized successfully!"
echo "Next steps:"
echo "1. Install backend dependencies: cd back && npm install"
echo "2. Install frontend dependencies: cd front && npm install"
echo "3. Configure environment variables in back/.env"
echo "4. Start the development servers"
