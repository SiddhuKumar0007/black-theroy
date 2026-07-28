"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Phone, MapPin, Award, ShieldAlert, Sparkles, RefreshCw, Plus } from 'lucide-react';
import { useAuth, API_URL } from '../../context/AuthContext';

export default function Profile() {
  const router = useRouter();
  const { isAuthenticated, token, user, loading: authLoading, updateProfile } = useAuth();

  // Profile forms
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Address States
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Address inputs
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrDefault, setAddrDefault] = useState(false);

  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=profile');
    } else if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [isAuthenticated, user, authLoading]);

  const fetchAddresses = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/addresses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAddresses(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [token]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrorMsg('');
    const res = await updateProfile(name, phone);
    if (res.success) {
      setMessage('Profile updated successfully');
    } else {
      setErrorMsg(res.message || 'Failed to update profile');
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setMessage('');

    const payload = {
      name: addrName,
      phone: addrPhone,
      street: addrStreet,
      city: addrCity,
      state: addrState,
      pincode: addrPincode,
      landmark: addrLandmark,
      isDefault: addrDefault
    };

    try {
      let res;
      if (editingAddressId) {
        // Update Address
        res = await fetch(`${API_URL}/addresses/${editingAddressId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        // Create Address
        res = await fetch(`${API_URL}/addresses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (data.success) {
        setMessage(editingAddressId ? 'Address updated successfully' : 'Address added successfully');
        setShowForm(false);
        setEditingAddressId(null);
        resetAddressInputs();
        fetchAddresses();
      } else {
        setErrorMsg(data.message || 'Address save failure');
      }
    } catch (err) {
      setErrorMsg('Error saving address details');
    }
  };

  const handleEditAddress = (addr) => {
    setEditingAddressId(addr._id);
    setAddrName(addr.name || '');
    setAddrPhone(addr.phone || '');
    setAddrStreet(addr.street || '');
    setAddrCity(addr.city || '');
    setAddrState(addr.state || '');
    setAddrPincode(addr.pincode || '');
    setAddrLandmark(addr.landmark || '');
    setAddrDefault(addr.isDefault || false);
    setShowForm(true);
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await fetch(`${API_URL}/addresses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Address deleted successfully');
        fetchAddresses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetAddressInputs = () => {
    setAddrName('');
    setAddrPhone('');
    setAddrStreet('');
    setAddrCity('');
    setAddrState('');
    setAddrPincode('');
    setAddrLandmark('');
    setAddrDefault(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Title */}
      <div className="border-b border-brand-silver dark:border-brand-grey pb-6 mb-10">
        <h1 className="font-display font-extrabold text-3xl uppercase tracking-widest flex items-center">
          <User size={24} className="mr-2" />
          YOUR PROFILE
        </h1>
        <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">
          Manage details, saved addresses and check loyalty tokens
        </p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 text-green-600 dark:text-green-400 text-xs rounded font-display uppercase tracking-widest">
          {message}
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs rounded font-display uppercase tracking-widest">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Profile forms & Loyalty Info */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Profile form */}
          <section className="bg-white dark:bg-brand-charcoal p-6 border border-brand-silver dark:border-brand-grey rounded shadow-sm">
            <h2 className="font-display font-bold text-xs uppercase tracking-widest text-neutral-400 mb-6 flex items-center">
              <User size={14} className="mr-2" />
              Member Details
            </h2>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] font-display font-bold uppercase tracking-widest text-neutral-500 mb-1">Email (Immutable)</label>
                <input 
                  type="email" 
                  value={user?.email || ''} 
                  disabled
                  className="w-full p-2 border border-brand-silver/50 dark:border-brand-grey/50 bg-neutral-100/55 dark:bg-neutral-900/55 text-neutral-400 text-xs rounded outline-none cursor-not-allowed" 
                />
              </div>
              <div>
                <label className="block text-[9px] font-display font-bold uppercase tracking-widest text-neutral-500 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-brand-silver dark:border-brand-grey bg-transparent text-xs rounded outline-none focus:border-brand-black dark:focus:border-white" 
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] font-display font-bold uppercase tracking-widest text-neutral-500 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 border border-brand-silver dark:border-brand-grey bg-transparent text-xs rounded outline-none focus:border-brand-black dark:focus:border-white" 
                />
              </div>
              <button 
                type="submit"
                className="w-full py-2.5 bg-brand-black dark:bg-white text-white dark:text-brand-black text-xs font-display font-extrabold uppercase tracking-widest hover:opacity-95"
              >
                Update Coordinates
              </button>
            </form>
          </section>

          {/* Loyalty Points */}
          <section className="bg-brand-black dark:bg-black text-white p-6 border border-brand-grey rounded shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-8 -translate-y-8 pointer-events-none" />
            <h2 className="font-display font-bold text-xs uppercase tracking-widest text-neutral-400 mb-4 flex items-center">
              <Award size={14} className="mr-2" />
              THEORY LOYALTY CLUB
            </h2>
            <div className="flex items-baseline space-x-2">
              <span className="font-display font-extrabold text-3xl">{user?.loyaltyPoints || 0}</span>
              <span className="text-[10px] uppercase tracking-widest text-neutral-400">Points Accumulated</span>
            </div>
            <p className="text-[9px] font-sans tracking-wide text-neutral-400 mt-4 leading-relaxed uppercase">
              Earn 1% back in points on every purchase. Redeem points for custom catalog releases and member discounts.
            </p>
          </section>

        </div>

        {/* Address Book Management */}
        <div className="lg:col-span-2">
          <section className="bg-white dark:bg-brand-charcoal p-6 border border-brand-silver dark:border-brand-grey rounded shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display font-bold text-xs uppercase tracking-widest text-neutral-400 flex items-center">
                <MapPin size={14} className="mr-2" />
                SAVED ADDRESS BOOK ({addresses.length})
              </h2>
              {!showForm && (
                <button 
                  onClick={() => { setShowForm(true); setEditingAddressId(null); resetAddressInputs(); }}
                  className="text-[10px] font-display font-bold tracking-widest text-brand-black dark:text-white uppercase flex items-center"
                >
                  <Plus size={10} className="mr-1" />
                  Add Address
                </button>
              )}
            </div>

            {showForm ? (
              /* Add/Edit Address form */
              <form onSubmit={handleSaveAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-brand-silver dark:border-brand-grey p-4 rounded mb-6">
                <div className="sm:col-span-2 border-b border-brand-silver dark:border-brand-grey pb-2 mb-2">
                  <h3 className="font-display font-bold text-xs uppercase tracking-widest">
                    {editingAddressId ? 'Edit Address Coordinates' : 'New Address Coordinates'}
                  </h3>
                </div>
                <div>
                  <label className="block text-[9px] font-display font-bold uppercase tracking-widest text-neutral-500 mb-1">Receiver Name</label>
                  <input 
                    type="text" 
                    value={addrName} 
                    onChange={(e) => setAddrName(e.target.value)}
                    className="w-full p-2 border border-brand-silver dark:border-brand-grey bg-transparent text-xs rounded outline-none" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-display font-bold uppercase tracking-widest text-neutral-500 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    value={addrPhone} 
                    onChange={(e) => setAddrPhone(e.target.value)}
                    className="w-full p-2 border border-brand-silver dark:border-brand-grey bg-transparent text-xs rounded outline-none" 
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[9px] font-display font-bold uppercase tracking-widest text-neutral-500 mb-1">Street Address</label>
                  <input 
                    type="text" 
                    value={addrStreet} 
                    onChange={(e) => setAddrStreet(e.target.value)}
                    className="w-full p-2 border border-brand-silver dark:border-brand-grey bg-transparent text-xs rounded outline-none" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-display font-bold uppercase tracking-widest text-neutral-500 mb-1">City</label>
                  <input 
                    type="text" 
                    value={addrCity} 
                    onChange={(e) => setAddrCity(e.target.value)}
                    className="w-full p-2 border border-brand-silver dark:border-brand-grey bg-transparent text-xs rounded outline-none" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-display font-bold uppercase tracking-widest text-neutral-500 mb-1">State</label>
                  <input 
                    type="text" 
                    value={addrState} 
                    onChange={(e) => setAddrState(e.target.value)}
                    className="w-full p-2 border border-brand-silver dark:border-brand-grey bg-transparent text-xs rounded outline-none" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-display font-bold uppercase tracking-widest text-neutral-500 mb-1">Pincode</label>
                  <input 
                    type="text" 
                    value={addrPincode} 
                    onChange={(e) => setAddrPincode(e.target.value)}
                    className="w-full p-2 border border-brand-silver dark:border-brand-grey bg-transparent text-xs rounded outline-none" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-display font-bold uppercase tracking-widest text-neutral-500 mb-1">Landmark (Optional)</label>
                  <input 
                    type="text" 
                    value={addrLandmark} 
                    onChange={(e) => setAddrLandmark(e.target.value)}
                    className="w-full p-2 border border-brand-silver dark:border-brand-grey bg-transparent text-xs rounded outline-none" 
                  />
                </div>
                <div className="sm:col-span-2 pt-2 flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={addrDefault}
                      onChange={(e) => setAddrDefault(e.target.checked)}
                      className="accent-brand-black dark:accent-white w-4 h-4"
                    />
                    <span className="text-[9px] font-display font-bold uppercase tracking-widest text-neutral-500">Set as default address</span>
                  </label>
                  <div className="flex space-x-2">
                    <button 
                      type="submit"
                      className="px-5 py-2 bg-brand-black dark:bg-white text-white dark:text-brand-black font-display font-bold text-xs uppercase tracking-widest rounded"
                    >
                      Save Coordinates
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setShowForm(false); setEditingAddressId(null); resetAddressInputs(); }}
                      className="px-5 py-2 border border-brand-silver dark:border-brand-grey text-neutral-500 font-display font-bold text-xs uppercase tracking-widest rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            ) : null}

            {/* Saved Addresses list */}
            {addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((a) => (
                  <div 
                    key={a._id}
                    className={`p-4 border rounded relative flex flex-col justify-between ${a.isDefault ? 'border-brand-black dark:border-white bg-brand-platinum dark:bg-brand-black/20' : 'border-brand-silver dark:border-brand-grey'}`}
                  >
                    <div>
                      <p className="text-xs font-display font-bold uppercase tracking-widest flex items-center">
                        {a.name}
                        {a.isDefault && <span className="text-[8px] border border-neutral-400 text-neutral-500 px-1 py-0.5 rounded font-normal ml-2 tracking-wide uppercase">Default</span>}
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 font-sans leading-relaxed">
                        {a.street}, {a.city}, {a.state} - {a.pincode}
                      </p>
                      <p className="text-[10px] text-neutral-500 font-sans mt-1">
                        Phone: {a.phone}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-brand-silver/50 dark:border-brand-grey/50 flex space-x-3 text-[10px] font-display font-bold tracking-widest uppercase">
                      <button onClick={() => handleEditAddress(a)} className="text-neutral-500 hover:text-brand-black dark:hover:text-white">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteAddress(a._id)} className="text-neutral-400 hover:text-red-500">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : !showForm ? (
              <p className="text-xs text-neutral-500 font-display uppercase tracking-widest italic py-8">
                No saved addresses. Click Add Address to register your coordinates.
              </p>
            ) : null}
          </section>
        </div>

      </div>
    </div>
  );
}
