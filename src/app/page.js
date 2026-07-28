"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, ChevronLeft, ChevronRight, Compass } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { API_URL } from '../context/AuthContext';

// Hardcoded mock products as a fallback if backend server is not running
const fallbackProducts = [
  {
    _id: 'fallback-1',
    name: 'Obsidian Heavyweight Oversized Tee',
    brand: 'Black Theory',
    price: 2499,
    salePrice: 1999,
    discountPercent: 20,
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600'
    ]
  },
  {
    _id: 'fallback-2',
    name: 'Monolith Raw Denim Jacket',
    brand: 'Black Theory',
    price: 7999,
    salePrice: 6499,
    discountPercent: 18,
    sizes: ['M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=600',
      'https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=600'
    ]
  },
  {
    _id: 'fallback-3',
    name: 'Spectral Chalk White Hoodie',
    brand: 'Black Theory',
    price: 4499,
    salePrice: 3899,
    discountPercent: 13,
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600'
    ]
  },
  {
    _id: 'fallback-4',
    name: 'Theory Tailored Cargo Joggers',
    brand: 'Black Theory',
    price: 3999,
    salePrice: 3299,
    discountPercent: 17,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600',
      'https://images.unsplash.com/photo-1517423568366-8b83523034fd?q=80&w=600'
    ]
  }
];

const reviews = [
  {
    name: "Aravind K.",
    rating: 5,
    comment: "The Obsidian Tee is spectacular. The collar ribbing holds up perfectly after multiple washes, and the 280 GSM weight creates the perfect drop."
  },
  {
    name: "Meera S.",
    rating: 5,
    comment: "Absolute luxury. The raw denim jacket is incredibly constructed. Reminds me of high-end Japanese selvedge denim labels twice the price."
  },
  {
    name: "Rohan D.",
    rating: 5,
    comment: "Excellent packaging and speed. The black tailored cargos fit me like a glove. Will be buying the Monolith denim line next."
  }
];

export default function Home() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [activeReviewIdx, setActiveReviewIdx] = useState(0);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const res = await fetch(`${API_URL}/products?limit=4`);
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          setNewArrivals(data.data);
        } else {
          setNewArrivals(fallbackProducts);
        }
      } catch (err) {
        console.warn('API connection failed. Using fallback products.');
        setNewArrivals(fallbackProducts);
      }
    };
    fetchNewArrivals();
  }, []);

  const handleNextReview = () => {
    setActiveReviewIdx((prev) => (prev + 1) % reviews.length);
  };

  const handlePrevReview = () => {
    setActiveReviewIdx((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* 1. Cinematic Hero Banner */}
      <section className="relative w-full h-[85vh] flex items-center justify-center bg-brand-black overflow-hidden">
        {/* Background dark overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-brand-black to-brand-black opacity-80 z-10" />
        
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full bg-cover bg-center opacity-65 scale-105 filter grayscale contrast-125" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1920')" }} />

        {/* Hero text */}
        <div className="relative max-w-4xl text-center px-6 z-20 flex flex-col items-center">
          <p className="text-[10px] sm:text-xs font-display font-extrabold uppercase tracking-[0.4em] text-neutral-400 mb-4 animate-fade-in">
            LUXURY T-SHIRT ARCHITECTURE
          </p>
          <h1 className="font-display font-extrabold text-4xl sm:text-7xl tracking-widest text-white uppercase leading-tight">
            THE HEAVYWEIGHT TEE
          </h1>
          <p className="max-w-md mt-6 font-sans text-xs sm:text-sm text-neutral-300 leading-relaxed uppercase tracking-widest">
            Architectural T-Shirt silhouettes engineered from 280-320 GSM organic combed cotton. Boxy drop-shoulder drapes preshrunk for life.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
            <Link 
              href="/shop" 
              className="px-8 py-3.5 bg-white text-brand-black font-display font-extrabold text-xs tracking-widest uppercase hover:bg-transparent hover:text-white border border-white transition-all shadow-lg"
            >
              EXPLORE ALL TEES
            </Link>
            <Link 
              href="/shop?subcategory=Oversized" 
              className="px-8 py-3.5 bg-transparent text-white font-display font-extrabold text-xs tracking-widest uppercase border border-neutral-600 hover:border-white transition-all"
            >
              OVERSIZED FIT
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Premium Category Grid */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-xs uppercase tracking-[0.3em] text-neutral-400">
            THE TEE ARCHITECTURE
          </h2>
          <h3 className="font-display font-extrabold text-2xl sm:text-4xl uppercase tracking-wider mt-2">
            DESIGNED CUTS & FITS
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Oversized Heavyweight', sub: 'Oversized', img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600' },
            { name: 'Acid Wash Relic', sub: 'Acid Wash', img: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=600' },
            { name: 'Graphic Typography', sub: 'Graphic', img: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600' },
            { name: 'Minimalist Core', sub: 'Minimalist', img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600' }
          ].map((cat, idx) => (
            <Link 
              key={idx}
              href={`/shop?subcategory=${encodeURIComponent(cat.sub)}`}
              className="group relative aspect-[4/5] bg-neutral-100 dark:bg-neutral-900 border border-brand-silver dark:border-brand-grey overflow-hidden"
            >
              <div className="absolute inset-0 bg-brand-black/20 group-hover:bg-brand-black/40 transition-colors z-10" />
              <img 
                src={cat.img} 
                alt={cat.name} 
                className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105 filter grayscale contrast-110" 
              />
              <div className="absolute inset-0 flex flex-col justify-end p-6 z-20">
                <h4 className="font-display font-bold text-sm tracking-widest text-white uppercase flex items-center">
                  <span>{cat.name}</span>
                  <ArrowRight size={14} className="ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. New Arrivals Carousel / Grid */}
      <section className="w-full py-16 bg-brand-platinum dark:bg-brand-darkgrey px-4 sm:px-6 lg:px-8 flex justify-center">
        <div className="max-w-7xl w-full">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-display font-bold text-xs uppercase tracking-[0.3em] text-neutral-400">
                LATEST RELEASES
              </h2>
              <h3 className="font-display font-extrabold text-2xl sm:text-4xl uppercase tracking-wider mt-2">
                NEW ARRIVALS
              </h3>
            </div>
            <Link 
              href="/shop" 
              className="hidden sm:flex items-center text-xs font-display font-extrabold tracking-widest uppercase hover:underline"
            >
              <span>VIEW ALL CATALOGUE</span>
              <ArrowRight size={14} className="ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Luxury Discount Banner */}
      <section className="relative w-full py-24 bg-brand-black flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-30 filter grayscale" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1200')" }} />
        <div className="relative z-10 max-w-3xl text-center px-6">
          <h2 className="font-display text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.4em] text-neutral-400 mb-3">
            PRIVATE DROPS & PRE-RELEASES
          </h2>
          <h3 className="font-display font-extrabold text-3xl sm:text-5xl tracking-widest text-white uppercase mb-6">
            GET 20% OFF YOUR FIRST ORDER
          </h3>
          <p className="max-w-md mx-auto text-xs sm:text-sm text-neutral-300 uppercase tracking-widest leading-relaxed mb-8">
            Apply code <span className="font-bold text-white px-2 py-1 bg-brand-grey/80 rounded border border-neutral-700">THEORY20</span> at checkout for orders above ₹2000.
          </p>
          <Link 
            href="/shop" 
            className="px-8 py-3 bg-white text-brand-black font-display font-extrabold text-xs tracking-widest uppercase hover:bg-transparent hover:text-white border border-white transition-all inline-block"
          >
            DISCOVER THE CATALOG
          </Link>
        </div>
      </section>

      {/* 5. Customer Reviews Slider */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 max-w-4xl text-center flex flex-col items-center">
        <Compass className="text-neutral-400 dark:text-neutral-500 mb-6 animate-spin-slow" size={28} />
        
        <div className="min-h-[150px] flex flex-col justify-center">
          <p className="font-sans italic text-lg sm:text-xl text-neutral-700 dark:text-neutral-300 max-w-2xl leading-relaxed">
            &quot;{reviews[activeReviewIdx].comment}&quot;
          </p>
          <div className="flex items-center justify-center space-x-1 mt-6 text-brand-black dark:text-neutral-300">
            {[...Array(reviews[activeReviewIdx].rating)].map((_, i) => (
              <Star key={i} size={14} className="fill-current" />
            ))}
          </div>
          <h4 className="font-display font-bold text-xs uppercase tracking-widest text-neutral-500 mt-2">
            {reviews[activeReviewIdx].name} — Verified Purchase
          </h4>
        </div>

        {/* review navigators */}
        <div className="flex space-x-4 mt-8">
          <button 
            onClick={handlePrevReview}
            className="p-2 border border-brand-silver dark:border-brand-grey rounded-full hover:bg-brand-platinum dark:hover:bg-brand-charcoal transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={handleNextReview}
            className="p-2 border border-brand-silver dark:border-brand-grey rounded-full hover:bg-brand-platinum dark:hover:bg-brand-charcoal transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
}
