const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://api-public-2.mtarget.fr',
      changeOrigin: true,
    })
  );
};
