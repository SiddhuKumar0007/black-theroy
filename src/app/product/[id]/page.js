"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, Share2, Star, ShoppingBag, Truck, Calendar, ShieldCheck, HelpCircle } from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import { useAuth, API_URL } from '../../../context/AuthContext';
import ProductCard from '../../../components/ProductCard';

const mockFallbackProduct = {
  _id: 'fallback-1',
  name: 'Obsidian Heavyweight Oversized Tee',
  brand: 'Black Theory',
  price: 2499,
  salePrice: 1999,
  discountPercent: 20,
  sku: 'BT-TEE-OBS-01',
  description: 'An architectural silhouette crafted from dense 280 GSM combed cotton. Featuring dropped shoulders, a tight ribbed mock neck, and a relaxed boxy fit that holds its shape. Double-needle stitch finishes. Preshrunk to ensure a permanent premium fit.',
  category: 'T-Shirts',
  material: '100% Organic Combed Cotton',
  gsm: 280,
  fitType: 'Oversized Fit',
  sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  colors: [
    { name: 'Pitch Black', hex: '#0B0B0B' },
    { name: 'Asphalt Grey', hex: '#3E3E3E' }
  ],
  images: [
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600'
  ],
  stockQuantity: 120,
  rating: 4.8,
  numReviews: 12
};

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated, token, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);

  // Image Zoom states
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' });

  // Add Review states
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');

  // Share tooltip status
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/products/${id}`);
        const data = await res.json();
        if (data.success && data.data) {
          setProduct(data.data);
          setActiveImage(data.data.images[0]);
          setSelectedColor(data.data.colors[0]);
        } else {
          setProduct(mockFallbackProduct);
          setActiveImage(mockFallbackProduct.images[0]);
          setSelectedColor(mockFallbackProduct.colors[0]);
        }
      } catch (err) {
        console.warn('API error, using local mock fallback.');
        setProduct(mockFallbackProduct);
        setActiveImage(mockFallbackProduct.images[0]);
        setSelectedColor(mockFallbackProduct.colors[0]);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  // Fetch reviews & similar products
  useEffect(() => {
    if (!product) return;

    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_URL}/reviews/${product._id}`);
        const data = await res.json();
        if (data.success) {
          setReviews(data.data);
        }
      } catch (err) {
        console.log('API Reviews Offline');
      }
    };

    const fetchSimilar = async () => {
      try {
        const res = await fetch(`${API_URL}/products/${product._id}/similar`);
        const data = await res.json();
        if (data.success) {
          setSimilarProducts(data.data);
        }
      } catch (err) {
        console.log('API Similar Offline');
      }
    };

    fetchReviews();
    fetchSimilar();
  }, [product]);

  const handleZoom = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${activeImage})`,
      backgroundPosition: `${x}% ${y}%`
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none', backgroundPosition: '0% 0%' });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity, selectedSize, selectedColor);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity, selectedSize, selectedColor);
    router.push('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`${API_URL}/reviews/${product._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: newRating, comment: newComment })
      });
      const data = await res.json();
      if (data.success) {
        setReviewMessage('Review posted successfully!');
        setNewComment('');
        // Reload reviews
        const reviewRes = await fetch(`${API_URL}/reviews/${product._id}`);
        const reviewData = await reviewRes.json();
        if (reviewData.success) {
          setReviews(reviewData.data);
        }
      } else {
        setReviewMessage(data.message || 'Failed to submit review');
      }
    } catch (err) {
      setReviewMessage('Error submitting review');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-black dark:border-white" />
      </div>
    );
  }

  if (!product) return <div className="text-center py-20">Product Not Found</div>;

  const currentPrice = product.salePrice || product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Product Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        
        {/* Left Side: Images */}
        <div className="flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails list */}
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:w-20 w-full flex-shrink-0">
            {product.images?.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`aspect-[3/4] md:w-20 w-16 bg-neutral-100 dark:bg-neutral-900 overflow-hidden border ${activeImage === img ? 'border-brand-black dark:border-white' : 'border-transparent'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Primary View Area + Zoom Panel */}
          <div className="relative flex-grow aspect-[3/4] bg-neutral-100 dark:bg-neutral-950 overflow-hidden border border-brand-silver dark:border-brand-grey">
            <img 
              src={activeImage} 
              alt={product.name} 
              onMouseMove={handleZoom}
              onMouseLeave={handleMouseLeave}
              className="w-full h-full object-cover cursor-zoom-in"
            />
            {/* Zoom Screen overlay */}
            <div 
              className="absolute inset-0 bg-no-repeat pointer-events-none z-20"
              style={{
                ...zoomStyle,
                backgroundSize: '200%'
              }}
            />
          </div>
        </div>

        {/* Right Side: Information */}
        <div className="flex flex-col justify-between">
          <div>
            {/* Brand, Title, Rating */}
            <p className="text-[10px] text-neutral-500 font-display font-bold uppercase tracking-widest">
              {product.brand}
            </p>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-wider mt-2 mb-3">
              {product.name}
            </h1>
            
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex text-brand-black dark:text-neutral-300">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < Math.round(product.rating) ? 'fill-current' : 'text-neutral-300 dark:text-neutral-700'} />
                ))}
              </div>
              <span className="text-xs text-neutral-500 uppercase font-display tracking-widest font-bold">
                {product.rating} ({product.numReviews} Reviews)
              </span>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline space-x-4 mb-8">
              {product.salePrice ? (
                <>
                  <span className="font-display font-extrabold text-2xl text-brand-black dark:text-white">₹{product.salePrice}</span>
                  <span className="font-display text-base text-neutral-500 line-through">₹{product.price}</span>
                  <span className="text-xs font-bold text-green-600 dark:text-green-400">({product.discountPercent}% OFF)</span>
                </>
              ) : (
                <span className="font-display font-extrabold text-2xl text-brand-black dark:text-white">₹{product.price}</span>
              )}
            </div>

            {/* Color selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-display font-bold uppercase tracking-wider text-neutral-500 mb-3">
                  Color: <span className="text-brand-black dark:text-white font-bold">{selectedColor?.name}</span>
                </p>
                <div className="flex space-x-3">
                  {product.colors.map((col) => (
                    <button
                      key={col.name}
                      onClick={() => setSelectedColor(col)}
                      className={`w-8 h-8 rounded-full border flex items-center justify-center ${selectedColor?.name === col.name ? 'border-brand-black dark:border-white scale-110' : 'border-transparent'}`}
                    >
                      <span className="w-6 h-6 rounded-full border border-black/10" style={{ backgroundColor: col.hex }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs font-display font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                    <span>Select Size</span>
                    {selectedSize && product.sizeStock && (
                      <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded ${
                        (product.sizeStock[selectedSize] || 0) > 0 
                          ? 'text-green-600 dark:text-green-400 bg-green-500/10' 
                          : 'text-red-500 bg-red-500/10'
                      }`}>
                        {(product.sizeStock[selectedSize] || 0) > 0 
                          ? `${product.sizeStock[selectedSize]} Pcs Available` 
                          : 'Out of Stock'}
                      </span>
                    )}
                  </p>
                  <button className="text-[10px] font-display font-bold tracking-widest text-neutral-400 hover:text-white uppercase">
                    Size Guide
                  </button>
                </div>
                <div className="flex gap-2">
                  {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => {
                    const count = product.sizeStock ? (product.sizeStock[sz] || 0) : 10;
                    const isAvailable = count > 0;
                    return (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`w-11 h-11 border text-xs font-display font-semibold flex items-center justify-center transition-all relative ${
                          selectedSize === sz 
                            ? 'bg-brand-black dark:bg-white text-white dark:text-brand-black border-brand-black dark:border-white font-bold' 
                            : isAvailable
                              ? 'border-brand-silver dark:border-brand-grey hover:border-neutral-500 text-neutral-600 dark:text-neutral-400'
                              : 'border-brand-silver/40 dark:border-brand-grey/40 text-neutral-400 opacity-50 line-through'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector & Stock Info */}
            <div className="flex items-center space-x-4 mb-8">
              <div className="flex items-center border border-brand-silver dark:border-brand-grey rounded overflow-hidden">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                >
                  -
                </button>
                <span className="px-5 font-bold font-display text-sm">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                >
                  +
                </button>
              </div>
              <p className="text-xs font-display uppercase tracking-widest text-neutral-400">
                {product.stockQuantity > 0 ? `${product.stockQuantity} items in stock` : 'Out of Stock'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                className="flex-grow py-4 bg-brand-black dark:bg-white text-white dark:text-brand-black font-display font-extrabold uppercase text-xs tracking-widest flex items-center justify-center space-x-2 border border-brand-black dark:border-white hover:bg-transparent dark:hover:bg-transparent hover:text-brand-black dark:hover:text-white transition-all"
              >
                <ShoppingBag size={14} />
                <span>ADD TO BAG</span>
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-grow py-4 bg-transparent text-brand-black dark:text-white font-display font-extrabold uppercase text-xs tracking-widest border border-brand-black dark:border-white hover:bg-brand-black dark:hover:bg-white hover:text-white dark:hover:text-brand-black transition-all"
              >
                BUY NOW
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className="p-4 border border-brand-silver dark:border-brand-grey text-neutral-600 dark:text-neutral-400 hover:text-red-500 rounded hover:scale-105 transition-transform"
                title="Save to wishlist"
              >
                <Heart size={16} className={isInWishlist(product._id) ? 'fill-red-500 text-red-500' : ''} />
              </button>
              <button
                onClick={handleShare}
                className="p-4 border border-brand-silver dark:border-brand-grey text-neutral-600 dark:text-neutral-400 hover:text-white rounded hover:scale-105 transition-transform relative"
                title="Share product link"
              >
                <Share2 size={16} />
                {copiedLink && (
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-800 text-white text-[9px] rounded font-display whitespace-nowrap uppercase tracking-widest z-30">
                    Copied Link!
                  </span>
                )}
              </button>
            </div>

            {/* Spec accordion details */}
            <div className="border-t border-brand-silver dark:border-brand-grey pt-6 space-y-4 text-xs font-sans tracking-wide">
              <div>
                <p className="font-display font-bold uppercase tracking-wider text-neutral-400 mb-1">Specifications</p>
                <div className="grid grid-cols-2 gap-y-2 border-b border-brand-silver/50 dark:border-brand-grey/50 pb-4 mt-2">
                  <div className="text-neutral-500 uppercase">Material</div>
                  <div className="font-semibold text-right">{product.material}</div>
                  <div className="text-neutral-500 uppercase">GSM weight</div>
                  <div className="font-semibold text-right">{product.gsm} GSM</div>
                  <div className="text-neutral-500 uppercase">Silhouette</div>
                  <div className="font-semibold text-right">{product.fitType}</div>
                  <div className="text-neutral-500 uppercase">SKU Reference</div>
                  <div className="font-semibold text-right truncate">{product.sku}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Reviews & Moderation Form */}
      <section className="mb-20">
        <h2 className="font-display font-extrabold text-xl uppercase tracking-widest border-b border-brand-silver dark:border-brand-grey pb-4 mb-8">
          RATINGS & REVIEWS
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Write a review */}
          <div className="md:col-span-1">
            <h3 className="font-display font-bold text-xs uppercase tracking-widest text-neutral-400 mb-4">
              Write a Review
            </h3>
            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-display font-bold uppercase tracking-widest text-neutral-500 mb-2">Rating</label>
                  <select 
                    value={newRating} 
                    onChange={(e) => setNewRating(Number(e.target.value))}
                    className="w-full p-2.5 border border-brand-silver dark:border-brand-grey bg-white dark:bg-brand-charcoal text-xs rounded outline-none font-display uppercase tracking-widest font-semibold"
                  >
                    <option value="5">5 Stars (Excellent)</option>
                    <option value="4">4 Stars (Good)</option>
                    <option value="3">3 Stars (Average)</option>
                    <option value="2">2 Stars (Poor)</option>
                    <option value="1">1 Star (Terrible)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-display font-bold uppercase tracking-widest text-neutral-500 mb-2">Review Comment</label>
                  <textarea 
                    placeholder="Describe your experience with this garment..." 
                    value={newComment} 
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full p-3 border border-brand-silver dark:border-brand-grey bg-white dark:bg-brand-charcoal text-xs rounded h-28 outline-none font-sans"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-2.5 bg-brand-black dark:bg-white text-white dark:text-brand-black font-display font-extrabold text-xs uppercase tracking-widest"
                >
                  Submit Review
                </button>
                {reviewMessage && <p className="text-xs font-display text-green-500 mt-2">{reviewMessage}</p>}
              </form>
            ) : (
              <p className="text-xs text-neutral-500 font-display uppercase tracking-wider leading-relaxed">
                Please <span className="font-bold underline cursor-pointer" onClick={() => router.push('/auth/login')}>login</span> to leave feedback on this product.
              </p>
            )}
          </div>

          {/* List reviews */}
          <div className="md:col-span-2 space-y-6">
            <h3 className="font-display font-bold text-xs uppercase tracking-widest text-neutral-400 mb-4">
              Client Feedbacks ({reviews.length})
            </h3>
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((rev) => (
                  <div key={rev._id} className="border-b border-brand-silver dark:border-brand-grey pb-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-display text-xs font-bold uppercase tracking-widest">{rev.userName}</span>
                        <div className="flex text-brand-black dark:text-neutral-300 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={10} className={i < rev.rating ? 'fill-current' : 'text-neutral-300 dark:text-neutral-700'} />
                          ))}
                        </div>
                      </div>
                      <span className="text-[9px] text-neutral-500 font-display">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans mt-3 leading-relaxed">
                      {rev.comment}
                    </p>
                    {/* Admin response block */}
                    {rev.replies && rev.replies.length > 0 && (
                      <div className="mt-4 ml-6 p-4 bg-brand-platinum dark:bg-brand-darkgrey border-l border-brand-black dark:border-white">
                        <p className="text-[9px] font-display font-bold uppercase tracking-wider text-brand-black dark:text-white">BLACK THEORY TEAM Response</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans mt-1.5 leading-relaxed">{rev.replies[0].comment}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 font-display italic">No client reviews yet. Be the first to share your thoughts!</p>
            )}
          </div>
        </div>
      </section>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section>
          <h2 className="font-display font-extrabold text-xl uppercase tracking-widest border-b border-brand-silver dark:border-brand-grey pb-4 mb-8">
            SIMILAR PRODUCTS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
