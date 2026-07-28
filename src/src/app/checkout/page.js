"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Plus, ShieldCheck, Receipt, CheckCircle } from 'lucide-react';
import { useAuth, API_URL } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Checkout() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, token } = useAuth();
  const { cartItems, coupon, subtotal, discountAmount, shippingCharges, total, clearCart } = useCart();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=checkout');
    }
  }, [isAuthenticated, authLoading, router]);



  // Address States
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // New Address Inputs
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPincode, setNewPincode] = useState('');
  const [newLandmark, setNewLandmark] = useState('');

  // GST Option
  const [enableGst, setEnableGst] = useState(false);
  const [gstNumber, setGstNumber] = useState('');

  // Payment: COD only
  const paymentMethod = 'cod';

  // Checkout Status flow: 'input' | 'processing' | 'confirmed'
  const [checkoutStatus, setCheckoutStatus] = useState('input');
  const [processingStatus, setProcessingStatus] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Error messages
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch saved addresses
  const fetchAddresses = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/addresses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAddresses(data.data);
        if (data.data.length > 0) {
          const def = data.data.find(a => a.isDefault);
          setSelectedAddressId(def ? def._id : data.data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [token]);

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await fetch(`${API_URL}/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newName,
          phone: newPhone,
          street: newStreet,
          city: newCity,
          state: newState,
          pincode: newPincode,
          landmark: newLandmark
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowNewAddressForm(false);
        setNewName(''); setNewPhone(''); setNewStreet(''); setNewCity(''); setNewState(''); setNewPincode(''); setNewLandmark('');
        fetchAddresses();
      } else {
        setErrorMsg(data.message || 'Failed to save address');
      }
    } catch (err) {
      setErrorMsg('Error creating address');
    }
  };

  // Create Order Helper
  const submitFinalOrder = async (addr, pGatewayId, pStatus = 'pending') => {
    const formattedItems = cartItems.map(item => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.salePrice || item.product.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color
    }));

    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        items: formattedItems,
        shippingAddress: {
          name: addr.name,
          phone: addr.phone,
          street: addr.street,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          landmark: addr.landmark
        },
        paymentMethod: 'cod',
        paymentGateway: 'cod',
        paymentGatewayId: pGatewayId,
        paymentStatus: pStatus,
        couponCode: coupon?.code || '',
        gstNumber: enableGst ? gstNumber : ''
      })
    });

    const data = await res.json();
    if (data.success) {
      setConfirmedOrder(data.data);
      clearCart();
      setCheckoutStatus('confirmed');
    } else {
      setErrorMsg(data.message || 'Failed to complete order registration');
      setCheckoutStatus('input');
    }
  };

  // Master Place Order Handler
  const handlePlaceOrder = async () => {
    setErrorMsg('');
    if (!selectedAddressId) {
      setErrorMsg('Please select a shipping address');
      return;
    }

    const addr = addresses.find(a => a._id === selectedAddressId);
    if (!addr) return;

    // ── CASH ON DELIVERY FLOW ──
    setCheckoutStatus('processing');
    setProcessingStatus('Registering Cash on Delivery order...');
    await new Promise(r => setTimeout(r, 1500));
    await submitFinalOrder(addr, `cod_${Math.random().toString(36).substring(2, 10)}`, 'pending');
  };

  if (checkoutStatus === 'processing') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-black dark:border-white mb-6" />
        <h2 className="font-display font-extrabold text-lg uppercase tracking-widest text-brand-black dark:text-white mb-2">
          SECURE CHECKOUT PROCESSING
        </h2>
        <p className="text-xs font-display text-neutral-500 uppercase tracking-widest animate-pulse max-w-sm">
          {processingStatus}
        </p>
      </div>
    );
  }

  if (checkoutStatus === 'confirmed' && confirmedOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center flex flex-col items-center justify-center">
        <CheckCircle size={56} className="text-green-500 mb-6" />
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-widest mb-3">
          ORDER CONFIRMED
        </h1>
        <p className="text-xs text-neutral-500 font-sans tracking-wide leading-relaxed max-w-md mb-8">
          Thank you for shopping with **Black Theory**. Your order has been securely registered. A copy of the receipt and tracking number will be sent to your email.
        </p>

        {/* Invoice Summary Box */}
        <div className="w-full bg-brand-platinum dark:bg-brand-charcoal border border-brand-silver dark:border-brand-grey p-6 rounded text-left mb-8 font-display tracking-widest text-xs uppercase text-neutral-600 dark:text-neutral-300">
          <div className="flex justify-between border-b border-brand-silver dark:border-brand-grey pb-3 mb-3 font-extrabold text-brand-black dark:text-white">
            <span>Order ID</span>
            <span>{confirmedOrder._id}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Payment Status</span>
            <span className="font-bold text-green-600 dark:text-green-400 uppercase">{confirmedOrder.paymentStatus}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Estimated Delivery</span>
            <span className="font-bold text-brand-black dark:text-white">
              {new Date(confirmedOrder.estimatedDeliveryDate).toDateString()}
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Courier Method</span>
            <span className="font-bold text-brand-black dark:text-white">Bluedart Express</span>
          </div>
          <div className="flex justify-between border-t border-brand-silver dark:border-brand-grey pt-3 font-extrabold text-brand-black dark:text-white text-sm">
            <span>Grand Total</span>
            <span>₹{confirmedOrder.totalAmount}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full">
          <button 
            onClick={() => router.push('/orders')}
            className="flex-grow py-3 bg-brand-black dark:bg-white text-white dark:text-brand-black text-xs font-display font-extrabold uppercase tracking-widest hover:opacity-90"
          >
            Track Order Status
          </button>
          <button 
            onClick={() => router.push('/shop')}
            className="flex-grow py-3 bg-transparent text-brand-black dark:text-white border border-brand-black dark:border-white text-xs font-display font-extrabold uppercase tracking-widest hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Continue Browsing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      <div className="border-b border-brand-silver dark:border-brand-grey pb-6 mb-10">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-widest flex items-center">
          <Receipt size={24} className="mr-2" />
          SECURE CHECKOUT
        </h1>
        <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">
          Review totals, set billing coordinates, and complete order
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs rounded font-display uppercase tracking-widest">
          {errorMsg}
        </div>
      )}

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* LEFT 2 COLUMNS: Address and Payment settings */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Shipping Address */}
            <section className="bg-white dark:bg-brand-charcoal p-6 border border-brand-silver dark:border-brand-grey rounded shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display font-bold text-xs uppercase tracking-widest text-neutral-400 flex items-center">
                  <MapPin size={14} className="mr-2" />
                  SHIPPING ADDRESS
                </h2>
                <button 
                  onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                  className="text-[10px] font-display font-bold tracking-widest text-brand-black dark:text-white uppercase flex items-center"
                >
                  <Plus size={10} className="mr-1" />
                  {showNewAddressForm ? 'Select Saved' : 'Add New'}
                </button>
              </div>

              {!showNewAddressForm ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div 
                      key={addr._id}
                      onClick={() => setSelectedAddressId(addr._id)}
                      className={`p-4 border rounded cursor-pointer transition-all ${selectedAddressId === addr._id ? 'border-brand-black dark:border-white bg-brand-platinum dark:bg-brand-black/40' : 'border-brand-silver dark:border-brand-grey bg-transparent'}`}
                    >
                      <p className="font-display font-extrabold text-xs uppercase tracking-wider mb-1">{addr.name}</p>
                      <p className="text-xs text-neutral-500 font-sans tracking-wide leading-relaxed">
                        {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-xs text-neutral-500 font-sans tracking-wide mt-1">
                        Phone: {addr.phone}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleAddNewAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-display font-bold uppercase tracking-widest text-neutral-500 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="Siddhu Kumar" 
                      value={newName} 
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full p-2 border border-brand-silver dark:border-brand-grey bg-transparent text-xs rounded outline-none" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-display font-bold uppercase tracking-widest text-neutral-500 mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="9654365649" 
                      value={newPhone} 
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full p-2 border border-brand-silver dark:border-brand-grey bg-transparent text-xs rounded outline-none" 
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[9px] font-display font-bold uppercase tracking-widest text-neutral-500 mb-1">Flat / House No / Street</label>
                    <input 
                      type="text" 
                      placeholder="Apt 4B, Black Theory Residency" 
                      value={newStreet} 
                      onChange={(e) => setNewStreet(e.target.value)}
                      className="w-full p-2 border border-brand-silver dark:border-brand-grey bg-transparent text-xs rounded outline-none" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-display font-bold uppercase tracking-widest text-neutral-500 mb-1">City</label>
                    <input 
                      type="text" 
                      placeholder="Mumbai" 
                      value={newCity} 
                      onChange={(e) => setNewCity(e.target.value)}
                      className="w-full p-2 border border-brand-silver dark:border-brand-grey bg-transparent text-xs rounded outline-none" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-display font-bold uppercase tracking-widest text-neutral-500 mb-1">State</label>
                    <input 
                      type="text" 
                      placeholder="Maharashtra" 
                      value={newState} 
                      onChange={(e) => setNewState(e.target.value)}
                      className="w-full p-2 border border-brand-silver dark:border-brand-grey bg-transparent text-xs rounded outline-none" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-display font-bold uppercase tracking-widest text-neutral-500 mb-1">Pincode</label>
                    <input 
                      type="text" 
                      placeholder="400050" 
                      value={newPincode} 
                      onChange={(e) => setNewPincode(e.target.value)}
                      className="w-full p-2 border border-brand-silver dark:border-brand-grey bg-transparent text-xs rounded outline-none" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-display font-bold uppercase tracking-widest text-neutral-500 mb-1">Landmark (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="Near Star Mall" 
                      value={newLandmark} 
                      onChange={(e) => setNewLandmark(e.target.value)}
                      className="w-full p-2 border border-brand-silver dark:border-brand-grey bg-transparent text-xs rounded outline-none" 
                    />
                  </div>
                  <div className="sm:col-span-2 pt-2 flex space-x-3">
                    <button 
                      type="submit"
                      className="px-6 py-2 bg-brand-black dark:bg-white text-white dark:text-brand-black font-display font-bold text-xs uppercase tracking-widest rounded"
                    >
                      Save Coordinates
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="px-6 py-2 border border-brand-silver dark:border-brand-grey text-neutral-500 font-display font-bold text-xs uppercase tracking-widest rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </section>

            {/* GST Option Accordion */}
            <section className="bg-white dark:bg-brand-charcoal p-6 border border-brand-silver dark:border-brand-grey rounded shadow-sm">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={enableGst}
                  onChange={(e) => setEnableGst(e.target.checked)}
                  className="accent-brand-black dark:accent-white w-4 h-4"
                />
                <span className="font-display font-bold text-xs uppercase tracking-widest text-neutral-400">
                  REQUEST B2B GST INVOICE
                </span>
              </label>

              {enableGst && (
                <div className="mt-4 max-w-sm">
                  <label className="block text-[9px] font-display font-bold uppercase tracking-widest text-neutral-500 mb-1">Business GSTIN Number</label>
                  <input 
                    type="text" 
                    placeholder="27AAAAA1111A1Z1" 
                    value={gstNumber} 
                    onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                    className="w-full p-2.5 border border-brand-silver dark:border-brand-grey bg-transparent text-xs font-display tracking-widest outline-none rounded"
                  />
                </div>
              )}
            </section>

            {/* Payment Method - COD Only */}
            <section className="bg-white dark:bg-brand-charcoal p-6 border border-brand-silver dark:border-brand-grey rounded shadow-sm">
              <h2 className="font-display font-bold text-xs uppercase tracking-widest text-neutral-400 mb-4 flex items-center">
                💵 PAYMENT METHOD
              </h2>

              <div className="p-4 border-2 border-brand-black dark:border-white bg-brand-platinum dark:bg-brand-black/40 rounded-lg font-display text-xs uppercase tracking-widest shadow-md">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">💵</span>
                  <p className="font-extrabold text-sm text-brand-black dark:text-white">Cash on Delivery</p>
                  <span className="ml-auto text-green-500 text-[10px] font-bold">✓</span>
                </div>
                <span className="text-[10px] text-neutral-400 font-normal tracking-wide normal-case block">
                  Pay in cash when your order arrives at your doorstep
                </span>
                <div className="mt-2">
                  <span className="text-[9px] bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">No Prepayment</span>
                </div>
              </div>
            </section>

          </div>

          {/* RIGHT 1 COLUMN: Order Summary totals */}
          <div className="lg:col-span-1">
            <div className="bg-brand-platinum dark:bg-brand-charcoal border border-brand-silver dark:border-brand-grey p-6 rounded sticky top-24 shadow-sm">
              <h2 className="font-display font-bold text-xs uppercase tracking-widest text-neutral-400 mb-6 flex items-center">
                <Receipt size={14} className="mr-2" />
                ORDER SUMMARY
              </h2>

              {/* Items List */}
              <div className="space-y-4 max-h-60 overflow-y-auto mb-6 pr-2">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs border-b border-brand-silver/50 dark:border-brand-grey/50 pb-3 last:border-0">
                    <div className="max-w-[180px]">
                      <p className="font-display font-semibold truncate uppercase">{item.product.name}</p>
                      <p className="text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5">
                        Qty: {item.quantity} | {item.size} | {item.color.name}
                      </p>
                    </div>
                    <span className="font-display font-bold text-brand-black dark:text-white">
                      ₹{(item.product.salePrice || item.product.price) * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cost breakdown */}
              <div className="border-t border-brand-silver dark:border-brand-grey pt-4 space-y-3 font-display tracking-widest text-xs uppercase text-neutral-600 dark:text-neutral-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-brand-black dark:text-white">₹{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Coupon Discount</span>
                    <span className="font-bold">-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-bold text-brand-black dark:text-white">
                    {shippingCharges === 0 ? 'FREE' : `₹${shippingCharges}`}
                  </span>
                </div>
                <div className="flex justify-between border-t border-brand-silver dark:border-brand-grey pt-4 font-extrabold text-brand-black dark:text-white text-sm">
                  <span>Total Amount</span>
                  <span>₹{total}</span>
                </div>
              </div>

              {/* Secure checkout */}
              <div className="mt-6 flex items-center justify-center space-x-2 text-[10px] font-display uppercase tracking-widest text-neutral-400 mb-6">
                <ShieldCheck size={14} className="text-green-500" />
                <span>Secure Checkout</span>
              </div>

              <button 
                id="place-order-btn"
                onClick={handlePlaceOrder}
                className="w-full py-4 bg-brand-black dark:bg-white text-white dark:text-brand-black font-display font-extrabold text-center uppercase tracking-widest text-xs border border-brand-black dark:border-white hover:bg-transparent dark:hover:bg-transparent hover:text-brand-black dark:hover:text-white transition-all rounded shadow-md"
              >
                PLACE ORDER (CASH ON DELIVERY)
              </button>
            </div>
          </div>

        </div>
      ) : (
        <div className="text-center py-20">
          <p className="font-display uppercase tracking-widest text-neutral-500 font-bold">Your Cart is empty</p>
          <button 
            onClick={() => router.push('/shop')}
            className="mt-4 px-6 py-2.5 bg-brand-black dark:bg-white text-white dark:text-brand-black text-xs font-display tracking-widest uppercase hover:opacity-85"
          >
            Explore Catalogue
          </button>
        </div>
      )}
    </div>
  );
}
