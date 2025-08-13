import Header from '../components/Header.js';
import Hero from '../components/Hero.js';
import Categories from '../components/Categories.js';
import FeaturedProducts from '../components/FeaturedProducts.js';
import Brands from '../components/Brands.js';
import Newsletter from '../components/Newsletter.js';
import Footer from '../components/Footer.js';

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <Hero />
        
        {/* Search Section */}
        <section className="py-12 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Find Your Perfect Beauty Products
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Search through our extensive collection of skincare, makeup, and beauty products. 
                Filter by category, brand, price, and more to find exactly what you need.
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for products, categories, or brands..."
                  className="w-full px-6 py-4 pl-12 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 text-lg shadow-soft hover:border-gray-300"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-primary-600 hover:to-accent-600 transition-all duration-300 transform hover:scale-105">
                  Search
                </button>
              </div>
            </div>
          </div>
        </section>
        
        <Categories />
        <FeaturedProducts />
        <Brands />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
