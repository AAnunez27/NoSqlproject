/**
 * MongoDB Atlas Direct Connectivity Check (sin SRV)
 *
 * Este script prueba conectividad directa sin usar registros SRV DNS
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

async function testDirectConnection() {
    console.log('🚀 Testing MongoDB Atlas with DIRECT connection (no SRV)...\n');

    // Leer credenciales desde variables de entorno (nunca hardcodear credenciales)
    const directUri = process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL;
    if (!directUri) {
        console.error('❌ DATABASE_URL_DIRECT o DATABASE_URL no están definidas en el archivo .env');
        process.exit(1);
    }

    console.log('🔧 Using direct connection (no SRV)');

    const client = new MongoClient(directUri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 10000,
    });

    try {
        console.log('🔌 Attempting direct connection...');
        await client.connect();
        console.log('✅ Direct connection successful!');

        console.log('🏓 Pinging database...');
        const pingResult = await client.db('admin').command({ ping: 1 });

        if (pingResult.ok === 1) {
            console.log('✅ Database ping successful!');
            console.log('🎉 Direct connection to MongoDB Atlas works!\n');
        }

    } catch (error) {
        console.error('❌ Direct connection also failed:', error.message);

        // Vamos a probar con hostnames específicos resueltos
        console.log('\n🔍 Trying with resolved IP addresses...');
        await testWithResolvedIPs();

    } finally {
        try {
            await client.close();
            console.log('🔒 Connection closed.');
        } catch (e) {}
    }
}

async function testWithResolvedIPs() {
    // Probamos con IPs resueltas (esto es solo como último recurso)
    const { lookup } = require('dns').promises;

    try {
        console.log('🔍 Resolving cluster0-shard-00-00.qm18xrk.mongodb.net...');
        const { address } = await lookup('cluster0-shard-00-00.qm18xrk.mongodb.net');
        console.log('✅ Resolved to:', address);

        // En este punto normalmente probaríamos la conectividad con la IP
        // Pero MongoDB Atlas requiere SNI, así que esto es solo informativo
        console.log('ℹ️  IP resolution works, this suggests the problem is with SRV records or SSL');

    } catch (lookupError) {
        console.log('❌ DNS resolution also failed:', lookupError.message);
        console.log('🚨 This indicates a more fundamental network connectivity issue');
    }
}

testDirectConnection().catch(console.error);
