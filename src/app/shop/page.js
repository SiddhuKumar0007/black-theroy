"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, Grid, List, RefreshCw } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import { API_URL } from '../../context/AuthContext';

const staticFallbackProducts = [
  {
    _id: 'fallback-1',
    name: 'Obsidian Heavyweight Oversized Tee',
    category: 'T-Shirts',
    subcategory: 'Oversized',
    price: 2499,
    salePrice: 1999,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Pitch Black', hex: '#0B0B0B' }],
    images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600']
  },
  {
    _id: 'fallback-2',
    name: 'Monolith Vintage Acid-Wash Tee',
    category: 'T-Shirts',
    subcategory: 'Acid Wash',
    price: 2999,
    salePrice: 2299,
    sizes: ['M', 'L', 'XL'],
    colors: [{ name: 'Acid Wash Charcoal', hex: '#2B2B2B' }],
    images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=600']
  },
  {
    _id: 'fallback-3',
    name: 'Spectral Chalk Architectural Graphic Tee',
    category: 'T-Shirts',
    subcategory: 'Graphic',
    price: 2799,
    salePrice: 2199,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Chalk White', hex: '#F9F6F0' }],
    images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600']
  },
  {
    _id: 'fallback-4',
    name: 'Theory Matte Core Minimalist Tee',
    category: 'T-Shirts',
    subcategory: 'Minimalist',
    price: 2299,
    salePrice: 1799,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Matte Onyx Black', hex: '#121212' }],
    images: ['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600']
  }
];

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [priceRange, setPriceRange] = useState(10000);
  const [sortBy, setSortBy] = useState('-createdAt');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  // Synchronize with URL search parameters
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedSubcategory(searchParams.get('subcategory') || '');
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `${API_URL}/products?sort=${sortBy}`;
        
        if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`;
        if (selectedSubcategory) url += `&subcategory=${encodeURIComponent(selectedSubcategory)}`;
        if (selectedSize) url += `&sizes=${encodeURIComponent(selectedSize)}`;
        if (selectedColor) url += `&colors=${encodeURIComponent(selectedColor)}`;
        if (priceRange) url += `&maxPrice=${priceRange}`;
        if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

        const res = await fetch(url);
        const data = await res.json();
        
        if (data.success && data.data) {
          setProducts(data.data);
        } else {
          let fallbacks = staticFallbackProducts;
          if (selectedSubcategory) {
            fallbacks = fallbacks.filter(p => p.subcategory?.toLowerCase().includes(selectedSubcategory.toLowerCase()));
          }
          setProducts(fallbacks);
        }
      } catch (err) {
        console.warn('API error, using static fallback products.');
        let fallbacks = staticFallbackProducts;
        if (selectedSubcategory) {
          fallbacks = fallbacks.filter(p => p.subcategory?.toLowerCase().includes(selectedSubcategory.toLowerCase()));
        }
        setProducts(fallbacks);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, selectedSubcategory, selectedSize, selectedColor, priceRange, sortBy, searchTerm]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedSize('');
    setSelectedColor('');
    setPriceRange(10000);
    setSearchTerm('');
    router.push('/shop');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Page Title */}
      <div className="border-b border-brand-silver dark:border-brand-grey pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end">
        <div>
          <h1 className="font-display font-extrabold text-3xl uppercase tracking-widest">
            {selectedCategory ? `${selectedCategory}` : 'ALL COLLECTIONS'}
          </h1>
          {searchTerm && (
            <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">
              Search Results for: &quot;{searchTerm}&quot;
            </p>
          )}
        </div>
        <div className="flex space-x-4 mt-4 md:mt-0 items-center w-full md:w-auto">
          {/* Sorting */}
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-brand-silver dark:border-brand-grey bg-white dark:bg-brand-charcoal text-xs uppercase font-display tracking-wider font-semibold rounded w-full md:w-auto"
          >
            <option value="-createdAt">Newest Arrivals</option>
            <option value="-rating">Top Rated</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
          </select>
          
          <button 
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center justify-center p-2 border border-brand-silver dark:border-brand-grey rounded hover:bg-neutral-100"
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>

      <div className="flex">
        
        {/* SIDEBAR FILTERS (Desktop) */}
        <aside className="hidden md:block w-64 pr-8 border-r border-brand-silver dark:border-brand-grey flex-shrink-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-widest flex items-center">
              <SlidersHorizontal size={14} className="mr-2" />
              FILTERS
            </h2>
            <button 
              onClick={clearFilters}
              className="text-[10px] font-display text-neutral-500 hover:text-brand-black dark:hover:text-white uppercase tracking-widest flex items-center"
            >
              <RefreshCw size={10} className="mr-1" />
              Reset All
            </button>
          </div>

          {/* Categories / Tee Fits Filter */}
          <div className="mb-8">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider mb-3">Tee Collections & Cuts</h3>
            <div className="space-y-2">
              {['All Tees', 'Oversized', 'Acid Wash', 'Graphic', 'Minimalist'].map((sub) => {
                const isSelected = sub === 'All Tees' ? !selectedSubcategory : selectedSubcategory === sub;
                return (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubcategory(sub === 'All Tees' ? '' : (selectedSubcategory === sub ? '' : sub))}
                    className={`block text-xs uppercase font-display tracking-widest text-left py-1 hover:pl-2 hover:text-brand-black dark:hover:text-white transition-all w-full ${isSelected ? 'font-bold pl-2 text-brand-black dark:text-white border-l-2 border-brand-black dark:border-white' : 'text-neutral-500'}`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sizes Filter */}
          <div className="mb-8">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider mb-3">Sizes</h3>
            <div className="flex flex-wrap gap-2">
              {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                  className={`w-9 h-9 border text-xs font-display font-semibold flex items-center justify-center transition-all ${selectedSize === sz ? 'bg-brand-black dark:bg-white text-white dark:text-brand-black border-brand-black dark:border-white' : 'border-brand-silver dark:border-brand-grey hover:border-neutral-500 text-neutral-600 dark:text-neutral-400'}`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Colors Filter */}
          <div className="mb-8">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider mb-3">Colors</h3>
            <div className="flex flex-wrap gap-3">
              {[
                { name: 'Chalk White', hex: '#F9F6F0' },
                { name: 'Pitch Black', hex: '#0B0B0B' },
                { name: 'Light Green', hex: '#90EE90' },
                { name: 'Olive Drab', hex: '#556B2F' },
                { name: 'Platinum Grey', hex: '#E5E4E2' },
                { name: 'Telemagenta', hex: '#CF3476' },
                { name: 'Orange', hex: '#FF6600' },
                { name: 'Red', hex: '#E63946' }
              ].map((col) => (
                <button
                  key={col.name}
                  onClick={() => setSelectedColor(selectedColor === col.name ? '' : col.name)}
                  className={`w-7 h-7 rounded-full border flex items-center justify-center ${selectedColor === col.name ? 'border-brand-black dark:border-white scale-110' : 'border-transparent'}`}
                  title={col.name}
                >
                  <span className="w-5 h-5 rounded-full border border-black/10" style={{ backgroundColor: col.hex }} />
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-display text-xs font-bold uppercase tracking-wider">Max Price</h3>
              <span className="text-xs font-display font-bold">₹{priceRange}</span>
            </div>
            <input 
              type="range" 
              min="1000" 
              max="10000" 
              step="500"
              value={priceRange} 
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-brand-black dark:accent-white"
            />
          </div>
        </aside>

        {/* PRODUCTS GRID */}
        <main className="flex-1 md:pl-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-black dark:border-white" />
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border border-brand-silver dark:border-brand-grey bg-brand-platinum dark:bg-brand-charcoal/50 rounded">
              <p className="font-display uppercase tracking-widest font-bold text-neutral-500">No products found matching filters</p>
              <button 
                onClick={clearFilters}
                className="mt-4 px-6 py-2.5 bg-brand-black dark:bg-white text-white dark:text-brand-black text-xs font-display tracking-widest uppercase hover:opacity-85"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* MOBILE FILTERS MODAL */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowMobileFilters(false)} />
          <div className="relative w-80 bg-white dark:bg-brand-black h-full p-6 flex flex-col justify-between overflow-y-auto border-l border-brand-silver dark:border-brand-grey shadow-xl">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-sm font-bold uppercase tracking-widest flex items-center">
                  FILTERS
                </h2>
                <button onClick={() => setShowMobileFilters(false)} className="text-xs uppercase font-display tracking-widest text-neutral-500 font-bold">
                  Close
                </button>
              </div>

              {/* Categories / Tee Fits */}
              <div className="mb-6">
                <h3 className="font-display text-xs font-bold uppercase tracking-wider mb-2">Tee Collections & Cuts</h3>
                <div className="space-y-1">
                  {['All Tees', 'Oversized', 'Acid Wash', 'Graphic', 'Minimalist'].map((sub) => {
                    const isSelected = sub === 'All Tees' ? !selectedSubcategory : selectedSubcategory === sub;
                    return (
                      <button
                        key={sub}
                        onClick={() => {
                          setSelectedSubcategory(sub === 'All Tees' ? '' : (selectedSubcategory === sub ? '' : sub));
                          setShowMobileFilters(false);
                        }}
                        className={`block w-full text-left py-1 text-xs uppercase tracking-widest font-display ${isSelected ? 'font-bold text-brand-black dark:text-white' : 'text-neutral-500'}`}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sizes */}
              <div className="mb-6">
                <h3 className="font-display text-xs font-bold uppercase tracking-wider mb-2">Sizes</h3>
                <div className="flex flex-wrap gap-2">
                  {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                      className={`w-8 h-8 border text-xs font-display font-semibold flex items-center justify-center ${selectedSize === sz ? 'bg-brand-black dark:bg-white text-white dark:text-brand-black border-brand-black dark:border-white' : 'border-brand-silver dark:border-brand-grey text-neutral-600 dark:text-neutral-400'}`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="mb-6">
                <h3 className="font-display text-xs font-bold uppercase tracking-wider mb-2">Colors</h3>
                <div className="flex gap-2">
                  {[
                    { name: 'Pitch Black', hex: '#0B0B0B' },
                    { name: 'Chalk White', hex: '#F9F6F0' },
                    { name: 'Asphalt Grey', hex: '#3E3E3E' }
                  ].map((col) => (
                    <button
                      key={col.name}
                      onClick={() => setSelectedColor(selectedColor === col.name ? '' : col.name)}
                      className={`w-6 h-6 rounded-full border ${selectedColor === col.name ? 'border-brand-black dark:border-white' : 'border-transparent'}`}
                    >
                      <span className="block w-4 h-4 rounded-full" style={{ backgroundColor: col.hex }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-display text-xs font-bold uppercase tracking-wider">Price Limit</h3>
                  <span className="text-xs font-display font-bold">₹{priceRange}</span>
                </div>
                <input 
                  type="range" 
                  min="1000" 
                  max="10000" 
                  step="500"
                  value={priceRange} 
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-brand-black dark:accent-white"
                />
              </div>
            </div>

            <button 
              onClick={clearFilters}
              className="w-full py-2.5 bg-neutral-200 dark:bg-neutral-800 text-brand-black dark:text-white text-xs font-display font-bold uppercase tracking-wider"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-black dark:border-white" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
