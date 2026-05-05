/**
 * MongoDB Atlas Connectivity Check
 *
 * This script verifies that your application can successfully connect to MongoDB Atlas.
 * It's designed for beginners to quickly test database connectivity.
 *
 * To install dependencies: npm install mongodb dotenv
 * To run this script: node mongodbPing.js
 */

// Load environment variables from .env file (if it exists)
require('dotenv').config();

// Import the MongoDB client
const { MongoClient } = require('mongodb');

/**
 * Main function to test MongoDB Atlas connectivity
 * We use an async function because MongoDB operations are asynchronous
 */
async function testMongoDBConnection() {
    // Step 1: Get the MongoDB connection string from environment variables
    // This keeps sensitive data out of your code
    const mongoUri = process.env.DATABASE_URL || process.env.MONGODB_URI;

    console.log('🚀 Starting MongoDB Atlas connectivity test...\n');

    // Step 2: Validate that we have a connection string
    if (!mongoUri) {
        console.error('❌ Error: No MongoDB connection string found.');
        console.error('   Please set DATABASE_URL or MONGODB_URI in your .env file');
        console.error('   Example: DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/database');
        process.exit(1);
    }

    // Don't log the full URI for security, just show that it's configured
    const maskedUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    console.log('🔧 Connection string configured:', maskedUri);

    // Step 3: Create MongoDB client with connection options
    // serverSelectionTimeoutMS: How long to wait when selecting a server
    // maxPoolSize: Maximum number of connections in the pool
    const client = new MongoClient(mongoUri, {
        serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
        connectTimeoutMS: 10000, // Connection timeout
        socketTimeoutMS: 10000, // Socket timeout
        maxPoolSize: 10, // Limit to 10 connections
    });

    try {
        console.log('🔌 Attempting to connect to MongoDB Atlas...');

        // Step 4: Connect to MongoDB Atlas
        // This establishes the actual connection to the database
        await client.connect();
        console.log('✅ Successfully connected to MongoDB Atlas!');

        // Step 5: Ping the database to verify it's responsive
        // The ping command is a lightweight way to test the connection
        console.log('🏓 Pinging database to verify connectivity...');
        const pingResult = await client.db('admin').command({ ping: 1 });

        if (pingResult.ok === 1) {
            console.log('✅ Database ping successful!');
            console.log('🎉 Your MongoDB Atlas connection is working perfectly!\n');
        } else {
            console.log('⚠️  Database ping returned unexpected result:', pingResult);
        }

        // Step 6: Test basic database operation (optional)
        // List databases to verify we have proper permissions
        console.log('📋 Testing database permissions...');
        const adminDb = client.db('admin');
        const databasesList = await adminDb.admin().listDatabases();
        console.log(`✅ Successfully listed ${databasesList.databases.length} database(s)`);

    } catch (error) {
        // Step 7: Handle any errors that occur during connection or ping
        console.error('❌ MongoDB Atlas connectivity test failed!');
        console.error('📋 Error details:');

        // Provide helpful error messages based on common issues
        if (error.message.includes('ECONNREFUSED')) {
            console.error('   - Connection refused: Check your network/firewall settings');
            console.error('   - Verify your cluster is not paused in MongoDB Atlas');
        } else if (error.message.includes('Authentication failed')) {
            console.error('   - Authentication failed: Check your username and password');
        } else if (error.message.includes('querySrv')) {
            console.error('   - DNS resolution failed: Check your internet connection');
            console.error('   - Verify the cluster hostname in your connection string');
        } else if (error.message.includes('serverSelectionTimeoutMS')) {
            console.error('   - Server selection timeout: Network or cluster availability issue');
            console.error('   - Check MongoDB Atlas Network Access (IP whitelist)');
        } else {
            console.error('   - Unexpected error:', error.message);
        }

        console.error('\n🔧 Troubleshooting tips:');
        console.error('   1. Verify your cluster is active (not paused) in MongoDB Atlas');
        console.error('   2. Check Network Access settings in MongoDB Atlas dashboard');
        console.error('   3. Ensure your current IP address is whitelisted');
        console.error('   4. Verify your database username and password are correct');
        console.error('   5. Try temporarily allowing all IPs (0.0.0.0/0) for testing');

    } finally {
        // Step 8: Always close the connection when done
        // This prevents memory leaks and hanging connections
        try {
            await client.close();
            console.log('🔒 Database connection closed safely.');
        } catch (closeError) {
            console.error('⚠️  Warning: Error closing database connection:', closeError.message);
        }
    }
}

// Step 9: Run the connectivity test
// We call the main function and handle any unhandled errors
testMongoDBConnection().catch((error) => {
    console.error('💥 Unhandled error in connectivity test:', error);
    process.exit(1);
});
