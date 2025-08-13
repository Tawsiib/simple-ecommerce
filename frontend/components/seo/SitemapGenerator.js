"use client";

import { useState, useEffect } from 'react';

const SitemapGenerator = ({ 
  enableAutoGeneration = true,
  refreshInterval = 86400000, // 24 hours
  onSitemapGenerated = null
}) => {
  const [sitemapData, setSitemapData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(null);
  const [error, setError] = useState(null);

  // Generate sitemap data
  const generateSitemap = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const response = await fetch('/api/seo/sitemap');
      if (!response.ok) {
        throw new Error('Failed to generate sitemap');
      }
      
      const data = await response.json();
      setSitemapData(data.data);
      setLastGenerated(new Date());
      
      // Call callback if provided
      if (onSitemapGenerated) {
        onSitemapGenerated(data.data);
      }
      
      return data.data;
    } catch (err) {
      setError(err.message);
      console.error('Sitemap generation failed:', err);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  // Download sitemap as XML
  const downloadSitemap = async () => {
    try {
      const sitemapData = await generateSitemap();
      
      // Convert to XML format
      const xml = generateSitemapXML(sitemapData);
      
      // Create and download file
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download sitemap:', err);
    }
  };

  // Generate XML format
  const generateSitemapXML = (data) => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add static pages
    if (data.pages) {
      data.pages.forEach(page => {
        xml += '  <url>\n';
        xml += `    <loc>${process.env.NEXT_PUBLIC_APP_URL || 'https://shohanisreflection.com'}${page.url}</loc>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += '  </url>\n';
      });
    }
    
    // Add product pages
    if (data.products) {
      data.products.forEach(product => {
        xml += '  <url>\n';
        xml += `    <loc>${process.env.NEXT_PUBLIC_APP_URL || 'https://shohanisreflection.com'}${product.url}</loc>\n`;
        xml += `    <priority>${product.priority}</priority>\n`;
        xml += `    <changefreq>${product.changefreq}</changefreq>\n`;
        if (product.lastmod) {
          xml += `    <lastmod>${product.lastmod}</lastmod>\n`;
        }
        xml += '  </url>\n';
      });
    }
    
    // Add category pages
    if (data.categories) {
      data.categories.forEach(category => {
        xml += '  <url>\n';
        xml += `    <loc>${process.env.NEXT_PUBLIC_APP_URL || 'https://shohanisreflection.com'}${category.url}</loc>\n`;
        xml += `    <priority>${category.priority}</priority>\n`;
        xml += `    <changefreq>${category.changefreq}</changefreq>\n`;
        if (category.lastmod) {
          xml += `    <lastmod>${category.lastmod}</lastmod>\n`;
        }
        xml += '  </url>\n';
      });
    }
    
    // Add brand pages
    if (data.brands) {
      data.brands.forEach(brand => {
        xml += '  <url>\n';
        xml += `    <loc>${process.env.NEXT_PUBLIC_APP_URL || 'https://shohanisreflection.com'}${brand.url}</loc>\n`;
        xml += `    <priority>${brand.priority}</priority>\n`;
        xml += `    <changefreq>${brand.changefreq}</changefreq>\n`;
        if (brand.lastmod) {
          xml += `    <lastmod>${brand.lastmod}</lastmod>\n`;
        }
        xml += '  </url>\n';
      });
    }
    
    xml += '</urlset>';
    return xml;
  };

  // Auto-generate sitemap on mount and at intervals
  useEffect(() => {
    if (enableAutoGeneration) {
      generateSitemap();
      
      const interval = setInterval(generateSitemap, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [enableAutoGeneration, refreshInterval]);

  // Generate robots.txt
  const generateRobotsTxt = async () => {
    try {
      const response = await fetch('/api/seo/robots.txt');
      if (!response.ok) {
        throw new Error('Failed to generate robots.txt');
      }
      
      const robotsContent = await response.text();
      
      // Download robots.txt
      const blob = new Blob([robotsContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'robots.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate robots.txt:', err);
    }
  };

  // Get sitemap statistics
  const getSitemapStats = () => {
    if (!sitemapData) return null;
    
    const stats = {
      total_urls: 0,
      pages: 0,
      products: 0,
      categories: 0,
      brands: 0
    };
    
    if (sitemapData.pages) stats.pages = sitemapData.pages.length;
    if (sitemapData.products) stats.products = sitemapData.products.length;
    if (sitemapData.categories) stats.categories = sitemapData.categories.length;
    if (sitemapData.brands) stats.brands = sitemapData.brands.length;
    
    stats.total_urls = stats.pages + stats.products + stats.categories + stats.brands;
    
    return stats;
  };

  const stats = getSitemapStats();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Sitemap Generator</h3>
        <div className="flex space-x-2">
          <button
            onClick={generateSitemap}
            disabled={isGenerating}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
          <button
            onClick={downloadSitemap}
            disabled={!sitemapData || isGenerating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Download XML
          </button>
          <button
            onClick={generateRobotsTxt}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Download Robots.txt
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">Error: {error}</p>
        </div>
      )}

      {lastGenerated && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 text-sm">
            Last generated: {lastGenerated.toLocaleString()}
          </p>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-md">
            <p className="text-2xl font-bold text-gray-900">{stats.total_urls}</p>
            <p className="text-sm text-gray-600">Total URLs</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-md">
            <p className="text-2xl font-bold text-gray-900">{stats.pages}</p>
            <p className="text-sm text-gray-600">Pages</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-md">
            <p className="text-2xl font-bold text-gray-900">{stats.products}</p>
            <p className="text-sm text-gray-600">Products</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-md">
            <p className="text-2xl font-bold text-gray-900">{stats.categories}</p>
            <p className="text-sm text-gray-600">Categories</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-md">
            <p className="text-2xl font-bold text-gray-900">{stats.brands}</p>
            <p className="text-sm text-gray-600">Brands</p>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-600">
        <p>• Sitemap is automatically generated every 24 hours</p>
        <p>• Click "Generate" to manually refresh the sitemap</p>
        <p>• Download XML for manual submission to search engines</p>
        <p>• Robots.txt is generated automatically</p>
      </div>
    </div>
  );
};

export default SitemapGenerator;
