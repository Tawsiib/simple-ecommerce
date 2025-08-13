import Header from '../components/Header';
import Hero from '../components/Hero';
import AdvancedSearch from '../components/search/AdvancedSearch';
import Categories from '../components/Categories';
import FeaturedProducts from '../components/FeaturedProducts';
import Brands from '../components/Brands';
import Newsletter from '../components/Newsletter';
import Footer from '../components/Footer';

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
              <AdvancedSearch />
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
