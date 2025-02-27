module.exports = async function (context, req) {
    context.log('Test function triggered');
    
    context.res = {
        status: 200,
        body: {
            message: "Test API is working",
            timestamp: new Date().toISOString(),
            method: req.method,
            params: req.params,
            query: req.query
        }
    };
}; 