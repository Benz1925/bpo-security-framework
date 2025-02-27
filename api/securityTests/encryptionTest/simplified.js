// Simplified version of the encryptionTest function for debugging purposes
module.exports = async function (context, req) {
    context.log('Simplified Encryption Test API triggered');
    
    context.res = {
        status: 200,
        body: {
            message: "Simplified Encryption Test API is working",
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.url,
            headers: req.headers,
            env: {
                NODE_ENV: process.env.NODE_ENV || 'not set',
                STORAGE_ACCOUNT_NAME: process.env.STORAGE_ACCOUNT_NAME ? "Set" : "Not set",
                STORAGE_ACCOUNT_KEY: process.env.STORAGE_ACCOUNT_KEY ? "Set" : "Not set",
                AZURE_SUBSCRIPTION_ID: process.env.AZURE_SUBSCRIPTION_ID ? "Set" : "Not set"
            }
        },
        headers: {
            'Content-Type': 'application/json'
        }
    };
}; 