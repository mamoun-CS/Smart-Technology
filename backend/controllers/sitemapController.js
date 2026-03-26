const productModel = require('../models/productModel');
const categoryModel = require('../models/productModel');

const sitemapController = {
  // Generate XML sitemap
  async generateSitemap(req, res) {
    try {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      
      // Get all products
      const products = await productModel.getAll({ limit: 1000 });
      
      // Get all categories
      const categories = await productModel.getCategories();
      
      // Build sitemap XML
      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/products</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/login</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/register</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`;

      // Add category pages
      for (const category of categories) {
        sitemap += `  <url>
    <loc>${baseUrl}/products?category=${category.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      }

      // Add product pages
      for (const product of products.products) {
        const lastMod = product.updated_at ? new Date(product.updated_at).toISOString() : new Date().toISOString();
        sitemap += `  <url>
    <loc>${baseUrl}/products/${product.id}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      }

      sitemap += '</urlset>';

      res.header('Content-Type', 'text/xml');
      res.send(sitemap);
    } catch (error) {
      console.error('Generate sitemap error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error generating sitemap' 
      });
    }
  },

  // Generate robots.txt
  async getRobotsTxt(req, res) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/api/sitemap.xml

# Disallow admin and API routes
Disallow: /api/
Disallow: /admin/
Disallow: /login
Disallow: /register
`;

    res.header('Content-Type', 'text/plain');
    res.send(robotsTxt);
  }
};

module.exports = sitemapController;