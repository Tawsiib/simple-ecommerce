import Header from '../components/Header.js';
import Hero from '../components/Hero.js';
import Categories from '../components/Categories.js';
import FeaturedProducts from '../components/FeaturedProducts.js';
import Brands from '../components/Brands.js';
import Newsletter from '../components/Newsletter.js';
import Footer from '../components/Footer.js';
import ThemeTest from '../components/ui/ThemeTest.js';

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Hero />
        
        {/* Enhanced Search Section */}
        <section className="py-16 sm:py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-slate-900 dark:via-purple-950 dark:to-indigo-950 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23a855f7%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30 dark:opacity-10"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
          
          <div className="container-custom relative z-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 px-4 py-2 rounded-full mb-6 animate-fade-in-up">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Smart Search</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                Find Your Perfect Beauty Products
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                Search through our extensive collection of skincare, makeup, and beauty products. 
                Filter by category, brand, price, and more to find exactly what you need.
              </p>
            </div>
            
            {/* Enhanced Search Card */}
            <div className="max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl border border-gray-200/30 dark:border-slate-700/30 shadow-xl dark:shadow-2xl p-8 sm:p-10">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for products, categories, or brands..."
                    className="w-full px-8 py-5 pl-16 bg-white dark:bg-slate-700 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-600 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-300 text-lg shadow-lg dark:shadow-xl hover:border-purple-300 dark:hover:border-purple-500 focus:shadow-2xl text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400"
                  />
                  <div className="absolute left-6 top-1/2 transform -translate-y-1/2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 dark:hover:from-purple-700 dark:hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                    Search
                  </button>
                </div>
                
                {/* Quick Search Tags */}
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {['Skincare', 'Makeup', 'Hair Care', 'Perfume', 'Body Care'].map((tag, index) => (
                    <button
                      key={tag}
                      className="px-4 py-2 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-800/70 hover:scale-105 transition-all duration-300"
                      style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Categories Section - Deep Ocean Background */}
        <section className="py-16 sm:py-20 bg-white dark:bg-slate-900">
          <Categories />
        </section>
        
        {/* Featured Products Section - Cosmic Purple Background */}
        <section className="py-16 sm:py-20 bg-slate-50 dark:bg-slate-800">
          <FeaturedProducts />
        </section>
        
        {/* Brands Section - Deep Indigo Background */}
        <section className="py-16 sm:py-20 bg-white dark:bg-slate-900">
          <Brands />
        </section>
        
        {/* Newsletter Section - Cosmic Gradient Background */}
        <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-purple-950 dark:to-indigo-950">
          <Newsletter />
        </section>
        
        {/* Theme Test Section - Deep Teal Background */}
        <section className="py-16 bg-slate-100 dark:bg-slate-800">
          <div className="container-custom">
            <ThemeTest />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
