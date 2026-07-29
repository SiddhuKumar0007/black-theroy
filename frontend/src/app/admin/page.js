"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, LayoutDashboard, Plus, Package, ShoppingCart, 
  Users, Ticket, AlertCircle, Ban, Trash2, Eye, Edit3, Check,
  Headset, MessageSquare, Send, Mail, Phone, MapPin, Copy, FileText
} from 'lucide-react';
import { useAuth, API_URL } from '../../context/AuthContext';

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, token, user, loading: authLoading } = useAuth();

  // Redirect if not admin
  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated && user && user.role !== 'admin') {
      router.push('/');
    } else if (!isAuthenticated) {
      router.push('/auth/login?redirect=admin');
    }
  }, [isAuthenticated, user, authLoading, router]);

  const [activeTab, setActiveTab] = useState('analytics'); // analytics, products, orders, customers, coupons

  // Dashboard Stats States
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    todaySales: 0,
    totalCustomers: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    conversionRate: 3.2
  });
  const [salesChart, setSalesChart] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);

  // Database Resources lists
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [coupons, setCoupons] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  // 1. Add Product Form Inputs
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodSalePrice, setProdSalePrice] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodCategory, setProdCategory] = useState('T-Shirts');
  const [prodSubcategory, setProdSubcategory] = useState('Oversized');

  // Color selection states
  const [prodColorName, setProdColorName] = useState('Pitch Black');
  const [prodColorHex, setProdColorHex] = useState('#0B0B0B');
  
  // Per-size stock breakdown
  const [stockS, setStockS] = useState('20');
  const [stockM, setStockM] = useState('35');
  const [stockL, setStockL] = useState('30');
  const [stockXL, setStockXL] = useState('15');
  const [stockXXL, setStockXXL] = useState('0');

  // Up to 5 optional product images
  const [prodImg1, setProdImg1] = useState('');
  const [prodImg2, setProdImg2] = useState('');
  const [prodImg3, setProdImg3] = useState('');
  const [prodImg4, setProdImg4] = useState('');
  const [prodImg5, setProdImg5] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // 2. Add Coupon Form Inputs
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [coupCode, setCoupCode] = useState('');
  const [coupType, setCoupType] = useState('percentage');
  const [coupValue, setCoupValue] = useState('');
  const [coupMinOrder, setCoupMinOrder] = useState('1000');
  const [coupUsageLimit, setCoupUsageLimit] = useState('100');
  const [coupExpiry, setCoupExpiry] = useState('2028-12-31');

  // Order Details Modal State
  const [selectedOrderModal, setSelectedOrderModal] = useState(null);
  const [copiedText, setCopiedText] = useState(false);

  // 3. Customer Support Chat States
  const [adminChats, setAdminChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [sendingAdminReply, setSendingAdminReply] = useState(false);

  const loadAdminChats = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/chat/admin/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAdminChats(data.chats);
        if (selectedChat) {
          const updated = data.chats.find(c => c._id === selectedChat._id);
          if (updated) setSelectedChat(updated);
        } else if (data.chats.length > 0) {
          setSelectedChat(data.chats[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load admin chats:', err);
    }
  };

  useEffect(() => {
    let interval;
    if (activeTab === 'support' && token) {
      loadAdminChats();
      interval = setInterval(loadAdminChats, 3000);
    }
    return () => clearInterval(interval);
  }, [activeTab, token]);

  const handleSendAdminReply = async (e) => {
    e.preventDefault();
    if (!selectedChat || !adminReplyText.trim()) return;

    setSendingAdminReply(true);
    try {
      const res = await fetch(`${API_URL}/chat/admin/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          chatId: selectedChat._id,
          text: adminReplyText.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedChat(data.chat);
        setAdminReplyText('');
        loadAdminChats();
      }
    } catch (err) {
      console.error('Failed to send admin reply:', err);
    } finally {
      setSendingAdminReply(false);
    }
  };

  // Load Admin Data
  const loadAdminData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // 1. Fetch dashboard metrics
      const statsRes = await fetch(`${API_URL}/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
        setSalesChart(statsData.salesChart);
        setLowStockAlerts(statsData.lowStockAlerts);
      }

      // 2. Fetch products list
      const prodRes = await fetch(`${API_URL}/products?adminView=true`);
      const prodData = await prodRes.json();
      if (prodData.success) {
        setProducts(prodData.data);
      }

      // 3. Fetch orders list
      const ordRes = await fetch(`${API_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const ordData = await ordRes.json();
      if (ordData.success) {
        setOrders(ordData.data);
      }

      // 4. Fetch customers list
      const custRes = await fetch(`${API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const custData = await custRes.json();
      if (custData.success) {
        setCustomers(custData.data);
      }

      // 5. Fetch coupons list
      const coupRes = await fetch(`${API_URL}/coupons`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const coupData = await coupRes.json();
      if (coupData.success) {
        setCoupons(coupData.data);
      }

    } catch (err) {
      console.warn('Dashboard error. Some resources fell back to offline simulators.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.role === 'admin') {
      loadAdminData();
    }
  }, [token, user]);

  // Product Actions
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setActionMessage('');

    // Filter out empty photo fields (up to 5 photos, optional)
    const rawImages = [prodImg1, prodImg2, prodImg3, prodImg4, prodImg5]
      .map((img) => img.trim())
      .filter((img) => img !== '');

    if (rawImages.length === 0) {
      rawImages.push('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600');
    }

    const s = Number(stockS) || 0;
    const m = Number(stockM) || 0;
    const l = Number(stockL) || 0;
    const xl = Number(stockXL) || 0;
    const xxl = Number(stockXXL) || 0;
    const totalQty = s + m + l + xl + xxl;

    const availableSizes = [];
    if (s > 0) availableSizes.push('S');
    if (m > 0) availableSizes.push('M');
    if (l > 0) availableSizes.push('L');
    if (xl > 0) availableSizes.push('XL');
    if (xxl > 0) availableSizes.push('XXL');
    if (availableSizes.length === 0) availableSizes.push('M');

    const colorsList = [];
    if (prodColorName.trim()) {
      colorsList.push({ name: prodColorName.trim(), hex: prodColorHex || '#0B0B0B' });
    } else {
      colorsList.push({ name: 'Pitch Black', hex: '#0B0B0B' });
    }

    const newProduct = {
      name: prodName,
      sku: prodSku,
      price: Number(prodPrice),
      salePrice: prodSalePrice ? Number(prodSalePrice) : null,
      description: prodDescription,
      category: prodCategory,
      subcategory: prodSubcategory || 'Oversized',
      sizeStock: { S: s, M: m, L: l, XL: xl, XXL: xxl },
      stockQuantity: totalQty,
      sizes: availableSizes,
      colors: colorsList,
      images: rawImages
    };

    try {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newProduct)
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage('Product created successfully!');
        setShowAddProductModal(false);
        resetProductInputs();
        loadAdminData();
      } else {
        alert(data.message || 'Failed to add product');
      }
    } catch (err) {
      alert('Error connecting to create product API');
    }
  };

  const resetProductInputs = () => {
    setProdName('');
    setProdSku('');
    setProdPrice('');
    setProdSalePrice('');
    setProdDescription('');
    setProdCategory('T-Shirts');
    setProdSubcategory('Oversized');
    setProdColorName('Pitch Black');
    setProdColorHex('#0B0B0B');
    setStockS('20');
    setStockM('35');
    setStockL('30');
    setStockXL('15');
    setStockXXL('0');
    setProdImg1('');
    setProdImg2('');
    setProdImg3('');
    setProdImg4('');
    setProdImg5('');
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this design?')) return;
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage('Product deleted successfully');
        loadAdminData();
      } else {
        alert(data.message || 'Failed to delete product');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to delete product API: ' + err.message);
    }
  };

  // Order Actions
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          orderStatus: newStatus,
          courierTracking: `BT-TRACK-${Math.floor(100000 + Math.random() * 900000)}`,
          courierName: 'Bluedart Courier'
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Order #${orderId.substring(0, 8)} status marked as ${newStatus}`);
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Customer Actions
  const handleToggleBanUser = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}/ban`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`User account status modified: ${data.message}`);
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Coupon Actions
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setActionMessage('');
    const newCoupon = {
      code: coupCode,
      discountType: coupType,
      discountValue: Number(coupValue),
      minOrderAmount: Number(coupMinOrder),
      usageLimit: Number(coupUsageLimit) || 100,
      expiryDate: coupExpiry
    };

    try {
      const res = await fetch(`${API_URL}/coupons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newCoupon)
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage('Coupon created successfully!');
        setShowAddCouponModal(false);
        setCoupCode('');
        setCoupValue('');
        loadAdminData();
      } else {
        alert(data.message || 'Coupon creation failed');
      }
    } catch (err) {
      alert('Error creating coupon');
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await fetch(`${API_URL}/coupons/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage('Coupon deleted successfully');
        loadAdminData();
      } else {
        alert(data.message || 'Failed to delete coupon');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to delete coupon API: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-black dark:border-white" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title */}
      <div className="border-b border-brand-silver dark:border-brand-grey pb-6 mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display font-extrabold text-2xl uppercase tracking-widest flex items-center">
            <ShieldAlert size={22} className="mr-2 text-red-500" />
            ADMIN CONTROL DASHBOARD
          </h1>
          <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">
            Store Metrics, Inventory control, orders and coupon releases
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className="mb-6 p-4 bg-neutral-900 text-white border border-neutral-700 text-xs rounded font-display uppercase tracking-widest">
          {actionMessage}
        </div>
      )}

      {/* Admin subtabs */}
      <div className="flex flex-wrap border-b border-brand-silver dark:border-brand-grey mb-8 font-display text-xs font-bold uppercase tracking-wider gap-x-6 gap-y-2">
        {[
          { id: 'analytics', name: 'Dashboard Analytics', icon: LayoutDashboard },
          { id: 'products', name: 'Product Inventory', icon: Package },
          { id: 'orders', name: 'Order Management', icon: ShoppingCart },
          { id: 'customers', name: 'Customer Database', icon: Users },
          { id: 'coupons', name: 'Coupons Manager', icon: Ticket },
          { id: 'support', name: 'Customer Support Chat', icon: Headset }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setActionMessage(''); }}
            className={`pb-3 text-left border-b-2 flex items-center space-x-1.5 transition-colors ${activeTab === tab.id ? 'border-brand-black dark:border-white text-brand-black dark:text-white' : 'border-transparent text-neutral-500'}`}
          >
            <tab.icon size={14} />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* 1. ANALYTICS BLOCK */}
      {activeTab === 'analytics' && (
        <div className="space-y-10 animate-fade-in">
          {/* Metrics grids */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Total Revenue', value: `₹${stats.totalRevenue}`, label: 'Cumulative sales' },
              { name: 'Total Orders', value: stats.totalOrders, label: 'All checkout cycles' },
              { name: 'Today\'s Sales', value: `₹${stats.todaySales}`, label: 'Orders placed today' },
              { name: 'Total Customers', value: stats.totalCustomers, label: 'Registered profiles' }
            ].map((card, idx) => (
              <div key={idx} className="p-6 bg-white dark:bg-brand-charcoal border border-brand-silver dark:border-brand-grey rounded shadow-sm">
                <p className="text-[10px] text-neutral-400 font-display font-bold uppercase tracking-widest">{card.name}</p>
                <p className="font-display font-extrabold text-2xl mt-2">{card.value}</p>
                <p className="text-[9px] text-neutral-500 font-sans mt-1 uppercase tracking-wide">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Low Stock Alerts */}
          {lowStockAlerts.length > 0 && (
            <div className="p-4 bg-red-950/20 border border-red-900 text-red-400 rounded text-xs font-display flex items-start space-x-2">
              <AlertCircle size={16} className="mt-0.5" />
              <div>
                <p className="font-bold uppercase tracking-widest mb-1">LOW STOCK ALERTS</p>
                <ul className="list-disc pl-4 space-y-1 font-sans">
                  {lowStockAlerts.map((prod) => (
                    <li key={prod._id}>
                      {prod.name} ({prod.sku}) has only <span className="font-bold">{prod.stock}</span> units remaining!
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* SVG-based clean analytics graph */}
          <section className="bg-white dark:bg-brand-charcoal p-6 border border-brand-silver dark:border-brand-grey rounded shadow-sm">
            <h2 className="font-display font-bold text-xs uppercase tracking-widest text-neutral-400 mb-6">
              WEEKLY SALES TRACKING
            </h2>
            <div className="h-64 w-full flex items-end justify-between px-2 pt-6">
              {salesChart.map((point, idx) => {
                const maxVal = Math.max(...salesChart.map(p => p.sales));
                const barHeight = maxVal > 0 ? (point.sales / maxVal) * 80 : 0;
                return (
                  <div key={idx} className="flex flex-col items-center w-full">
                    <span className="text-[9px] font-display font-bold mb-2">₹{(point.sales / 1000).toFixed(0)}K</span>
                    <div 
                      className="w-10 bg-brand-black dark:bg-white rounded-t transition-all duration-700" 
                      style={{ height: `${barHeight}%`, minHeight: '4px' }}
                    />
                    <span className="text-[9px] text-neutral-500 font-display font-bold uppercase tracking-widest mt-2">{point.day}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* 2. PRODUCT CRUD BLOCK */}
      {activeTab === 'products' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h2 className="font-display font-bold text-xs uppercase tracking-widest text-neutral-400">
              CLOTHING ARCHIVES
            </h2>
            <button 
              onClick={() => setShowAddProductModal(true)}
              className="px-4 py-2 bg-brand-black dark:bg-white text-white dark:text-brand-black font-display font-extrabold text-xs tracking-widest uppercase flex items-center space-x-1.5 rounded"
            >
              <Plus size={12} />
              <span>Create Product</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-brand-silver dark:border-brand-grey rounded bg-white dark:bg-brand-charcoal">
            <table className="w-full text-left border-collapse text-xs font-display tracking-wider">
              <thead>
                <tr className="border-b border-brand-silver dark:border-brand-grey bg-brand-platinum dark:bg-brand-black/50 text-[10px] text-neutral-400 font-bold uppercase">
                  <th className="p-4">Product details</th>
                  <th className="p-4">SKU / Code</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4 text-center">Stock</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod._id} className="border-b border-brand-silver dark:border-brand-grey last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                    <td className="p-4 flex items-center">
                      <img src={prod.images[0]} alt="" className="w-8 h-10 object-cover bg-neutral-100 rounded mr-3" />
                      <div>
                        <span className="font-semibold block">{prod.name}</span>
                        <span className="text-[9px] text-neutral-500 uppercase">{prod.fitType}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-semibold uppercase">{prod.sku}</td>
                    <td className="p-4 text-neutral-500 uppercase">{prod.category}</td>
                    <td className="p-4 font-bold">₹{prod.salePrice || prod.price}</td>
                    <td className="p-4 text-center font-bold">
                      <span className={prod.stockQuantity <= prod.lowStockLimit ? 'text-red-500' : ''}>
                        {prod.stockQuantity}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center items-center space-x-3">
                        <button onClick={() => router.push(`/product/${prod._id}`)} className="text-neutral-500 hover:text-white" title="View details">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => handleDeleteProduct(prod._id)} className="text-neutral-400 hover:text-red-500" title="Delete product">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ORDER WORKFLOW BLOCK */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="font-display font-bold text-xs uppercase tracking-widest text-neutral-400">
            CLIENT ORDERS RECEIVED
          </h2>

          <div className="overflow-x-auto border border-brand-silver dark:border-brand-grey rounded bg-white dark:bg-brand-charcoal">
            <table className="w-full text-left border-collapse text-xs font-display tracking-wider">
              <thead>
                <tr className="border-b border-brand-silver dark:border-brand-grey bg-brand-platinum dark:bg-brand-black/50 text-[10px] text-neutral-400 font-bold uppercase">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer Contact</th>
                  <th className="p-4">Delivery Address</th>
                  <th className="p-4">Amount & Payment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions & Slip</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => {
                  const addr = ord.shippingAddress || {};
                  const customerPhone = addr.phone || ord.user?.phone || 'No phone provided';
                  const customerName = addr.name || ord.user?.name || 'Customer';
                  const fullAddress = `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`;

                  return (
                    <tr key={ord._id} className="border-b border-brand-silver dark:border-brand-grey last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                      <td className="p-4 font-mono font-bold uppercase">
                        #{ord._id.substring(0, 8)}
                      </td>
                      <td className="p-4 space-y-1">
                        <p className="font-extrabold text-brand-black dark:text-white">{customerName}</p>
                        <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center">
                          <Phone size={12} className="mr-1" />
                          {customerPhone}
                        </p>
                        <p className="text-[9px] text-neutral-500 font-sans tracking-normal">{ord.user?.email || 'N/A'}</p>
                      </td>
                      <td className="p-4 min-w-[260px] max-w-[340px] whitespace-normal break-words">
                        <div className="flex items-start space-x-1.5 text-neutral-800 dark:text-neutral-200">
                          <MapPin size={15} className="mt-0.5 text-emerald-500 flex-shrink-0" />
                          <div className="space-y-1 w-full">
                            <p className="font-bold text-xs leading-relaxed text-brand-black dark:text-white break-words">
                              {addr.street || 'Address not provided'}
                            </p>
                            {addr.landmark && (
                              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                                📍 Landmark: {addr.landmark}
                              </p>
                            )}
                            <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                              {addr.city}, {addr.state} - <span className="font-mono text-emerald-500 font-bold">{addr.pincode}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 space-y-1">
                        <p className="font-extrabold text-sm">₹{ord.totalAmount}</p>
                        <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded ${ord.paymentMethod === 'cod' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-green-500/20 text-green-500 border border-green-500/30'}`}>
                          {ord.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : `Paid (${ord.paymentMethod})`}
                        </span>
                      </td>
                      <td className="p-4 font-bold uppercase">
                        <span className={`px-2 py-1 border text-[9px] rounded block text-center ${ord.orderStatus === 'delivered' ? 'border-green-500 text-green-500 bg-green-500/10' : ord.orderStatus === 'cancelled' ? 'border-red-500 text-red-500' : 'border-amber-500 text-amber-500 bg-amber-500/10'}`}>
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col items-center space-y-2 text-[10px] font-display font-bold uppercase">
                          <button
                            onClick={() => setSelectedOrderModal(ord)}
                            className="w-full px-3 py-1.5 bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black rounded flex items-center justify-center space-x-1 hover:opacity-90"
                          >
                            <Eye size={12} />
                            <span>View Full Slip</span>
                          </button>
                          {ord.orderStatus === 'pending' && (
                            <button 
                              onClick={() => handleUpdateOrderStatus(ord._id, 'processing')}
                              className="w-full px-3 py-1 bg-brand-black dark:bg-white text-white dark:text-brand-black hover:opacity-85 rounded"
                            >
                              Accept
                            </button>
                          )}
                          {ord.orderStatus === 'processing' && (
                            <button 
                              onClick={() => handleUpdateOrderStatus(ord._id, 'shipped')}
                              className="w-full px-3 py-1 bg-brand-black dark:bg-white text-white dark:text-brand-black hover:opacity-85 rounded"
                            >
                              Ship Order
                            </button>
                          )}
                          {ord.orderStatus === 'shipped' && (
                            <button 
                              onClick={() => handleUpdateOrderStatus(ord._id, 'delivered')}
                              className="w-full px-3 py-1 bg-green-600 text-white hover:bg-green-700 rounded"
                            >
                              Mark Delivered
                            </button>
                          )}
                          {ord.orderStatus !== 'delivered' && ord.orderStatus !== 'cancelled' && (
                            <button 
                              onClick={() => handleUpdateOrderStatus(ord._id, 'cancelled')}
                              className="w-full px-3 py-1 border border-red-500 text-red-500 hover:bg-red-500/10 rounded"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. CUSTOMER DATABASE BLOCK */}
      {activeTab === 'customers' && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="font-display font-bold text-xs uppercase tracking-widest text-neutral-400">
            REGISTERED CLIENTS DATABASE
          </h2>

          <div className="overflow-x-auto border border-brand-silver dark:border-brand-grey rounded bg-white dark:bg-brand-charcoal">
            <table className="w-full text-left border-collapse text-xs font-display tracking-wider">
              <thead>
                <tr className="border-b border-brand-silver dark:border-brand-grey bg-brand-platinum dark:bg-brand-black/50 text-[10px] text-neutral-400 font-bold uppercase">
                  <th className="p-4">Client Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Contact Phone</th>
                  <th className="p-4 text-center">Loyalty Points</th>
                  <th className="p-4 text-center">Banned Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((cust) => (
                  <tr key={cust._id} className="border-b border-brand-silver dark:border-brand-grey last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                    <td className="p-4 font-semibold">{cust.name}</td>
                    <td className="p-4 font-sans tracking-normal">{cust.email}</td>
                    <td className="p-4 font-sans tracking-normal">{cust.phone || 'N/A'}</td>
                    <td className="p-4 text-center font-bold">{cust.loyaltyPoints}</td>
                    <td className="p-4 text-center">
                      <span className={`font-bold uppercase text-[10px] ${cust.isBanned ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                        {cust.isBanned ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleToggleBanUser(cust._id)}
                        className={`p-1.5 rounded transition-colors ${cust.isBanned ? 'text-green-600 dark:text-green-400 hover:bg-green-500/10' : 'text-red-500 hover:bg-red-500/10'}`}
                        title={cust.isBanned ? 'Re-activate Account' : 'Suspend Account'}
                      >
                        <Ban size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. COUPONS MANAGER BLOCK */}
      {activeTab === 'coupons' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h2 className="font-display font-bold text-xs uppercase tracking-widest text-neutral-400">
              ACTIVE DISCOUNT CAMPAIGNS
            </h2>
            <button 
              onClick={() => setShowAddCouponModal(true)}
              className="px-4 py-2 bg-brand-black dark:bg-white text-white dark:text-brand-black font-display font-extrabold text-xs tracking-widest uppercase flex items-center space-x-1.5 rounded"
            >
              <Plus size={12} />
              <span>Create Coupon</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-brand-silver dark:border-brand-grey rounded bg-white dark:bg-brand-charcoal">
            <table className="w-full text-left border-collapse text-xs font-display tracking-wider">
              <thead>
                <tr className="border-b border-brand-silver dark:border-brand-grey bg-brand-platinum dark:bg-brand-black/50 text-[10px] text-neutral-400 font-bold uppercase">
                  <th className="p-4">Coupon Code</th>
                  <th className="p-4">Discount details</th>
                  <th className="p-4">Min Spend</th>
                  <th className="p-4">Expiry Date</th>
                  <th className="p-4 text-center">Usages</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coup) => (
                  <tr key={coup._id} className="border-b border-brand-silver dark:border-brand-grey last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                    <td className="p-4 font-mono font-extrabold uppercase text-brand-black dark:text-white tracking-widest bg-brand-platinum/50 dark:bg-brand-charcoal/50 text-center w-32 border-r border-brand-silver dark:border-brand-grey">{coup.code}</td>
                    <td className="p-4 font-semibold uppercase">
                      {coup.discountType === 'percentage' ? `${coup.discountValue}% Off` : coup.discountType === 'flat' ? `₹${coup.discountValue} Off` : 'Free Shipping'}
                    </td>
                    <td className="p-4 font-bold">₹{coup.minOrderAmount}</td>
                    <td className="p-4 font-sans tracking-normal">{new Date(coup.expiryDate).toLocaleDateString()}</td>
                    <td className="p-4 text-center font-semibold">{coup.usedCount} / {coup.usageLimit}</td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleDeleteCoupon(coup._id)} className="text-neutral-400 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. CUSTOMER SUPPORT CHAT BLOCK */}
      {activeTab === 'support' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-display font-bold text-xs uppercase tracking-widest text-neutral-400">
                LIVE CUSTOMER SUPPORT CONVERSATIONS
              </h2>
              <p className="text-[11px] text-neutral-500 mt-1">
                View customer messages, see their email address, and send direct support replies.
              </p>
            </div>
            <button
              onClick={loadAdminChats}
              className="px-3 py-1.5 border border-brand-silver dark:border-brand-grey text-xs font-display font-bold uppercase rounded hover:bg-neutral-800 transition"
            >
              Refresh Inbox
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px] border border-brand-silver dark:border-brand-grey rounded overflow-hidden bg-white dark:bg-brand-charcoal">
            {/* Left Panel: Conversation Threads */}
            <div className="lg:col-span-1 border-r border-brand-silver dark:border-brand-grey overflow-y-auto flex flex-col">
              <div className="p-3 bg-brand-platinum dark:bg-brand-black/60 border-b border-brand-silver dark:border-brand-grey font-display text-[10px] font-bold uppercase text-neutral-400 tracking-wider">
                Conversations ({adminChats.length})
              </div>
              <div className="divide-y divide-brand-silver dark:divide-brand-grey flex-1 overflow-y-auto">
                {adminChats.length === 0 ? (
                  <div className="p-8 text-center text-xs text-neutral-500">
                    No active support messages yet.
                  </div>
                ) : (
                  adminChats.map((c) => {
                    const isSelected = selectedChat?._id === c._id;
                    return (
                      <button
                        key={c._id}
                        onClick={() => setSelectedChat(c)}
                        className={`w-full p-4 text-left transition-colors flex flex-col justify-between ${
                          isSelected
                            ? 'bg-neutral-100 dark:bg-neutral-800/80 border-l-4 border-brand-black dark:border-white'
                            : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/30'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="truncate pr-2">
                            <h4 className="font-display font-bold text-xs text-brand-black dark:text-white truncate">
                              {c.userName}
                            </h4>
                            <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 truncate mt-0.5">
                              {c.userEmail}
                            </p>
                          </div>
                          {c.unreadByAdmin && (
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0 mt-1" title="New Message" />
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 line-clamp-1 mt-2 font-sans">
                          {c.lastMessage || 'No messages yet'}
                        </p>
                        <span className="text-[9px] text-neutral-500 mt-2 block font-mono">
                          {new Date(c.updatedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Panel: Chat Message Log & Reply Box */}
            <div className="lg:col-span-2 flex flex-col h-full bg-white dark:bg-brand-charcoal">
              {selectedChat ? (
                <>
                  {/* Selected Customer Header */}
                  <div className="p-4 bg-brand-platinum dark:bg-brand-black/60 border-b border-brand-silver dark:border-brand-grey flex justify-between items-center">
                    <div>
                      <h3 className="font-display font-extrabold text-sm text-brand-black dark:text-white">
                        {selectedChat.userName}
                      </h3>
                      <p className="text-xs font-mono text-emerald-500">
                        Email: {selectedChat.userEmail}
                      </p>
                    </div>
                    <span className={`text-[10px] font-display uppercase tracking-widest px-2.5 py-1 rounded ${
                      selectedChat.status === 'open' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {selectedChat.status}
                    </span>
                  </div>

                  {/* Messages Scroll Area */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans">
                    {selectedChat.messages?.map((msg, idx) => {
                      const isCustomer = msg.senderRole === 'customer';
                      return (
                        <div
                          key={idx}
                          className={`flex ${isCustomer ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg text-xs ${
                              isCustomer
                                ? 'bg-neutral-100 dark:bg-neutral-800 text-brand-black dark:text-white border border-brand-silver dark:border-neutral-700'
                                : 'bg-brand-black dark:bg-white text-white dark:text-brand-black font-medium'
                            }`}
                          >
                            <p>{msg.text}</p>
                            <div className="flex items-center justify-between space-x-2 mt-1 opacity-70 text-[9px]">
                              <span>{msg.senderName}</span>
                              <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reply Input Box */}
                  <form onSubmit={handleSendAdminReply} className="p-4 border-t border-brand-silver dark:border-brand-grey bg-brand-platinum/50 dark:bg-brand-black/40 flex items-center space-x-3">
                    <input
                      type="text"
                      value={adminReplyText}
                      onChange={(e) => setAdminReplyText(e.target.value)}
                      placeholder={`Reply to ${selectedChat.userName} (${selectedChat.userEmail})...`}
                      className="flex-1 p-3 border border-brand-silver dark:border-brand-grey bg-white dark:bg-neutral-900 text-xs rounded text-brand-black dark:text-white outline-none focus:border-brand-black dark:focus:border-white"
                    />
                    <button
                      type="submit"
                      disabled={sendingAdminReply || !adminReplyText.trim()}
                      className="px-6 py-3 bg-brand-black dark:bg-white text-white dark:text-brand-black font-display font-extrabold text-xs uppercase tracking-widest rounded flex items-center space-x-2 hover:opacity-90 disabled:opacity-40 transition"
                    >
                      <Send size={14} />
                      <span>Reply</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-neutral-500 font-display uppercase tracking-widest">
                  Select a customer conversation from the left to read and reply.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {/* 1. Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-brand-charcoal border border-brand-silver dark:border-brand-grey p-8 rounded w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-display font-extrabold text-lg uppercase tracking-widest mb-6">Create New Clothing Item</h3>
            <form onSubmit={handleCreateProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-display font-bold uppercase tracking-widest text-neutral-500 mb-1">Product Name</label>
                <input 
                  type="text" 
                  value={prodName} 
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full p-2 border border-brand-silver dark:border-brand-grey bg-transparent text-xs rounded outline-none" 
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] font-display font-bold uppercase tracking-widest text-neutral-500 mb-1">SKU Code</label>
                <input 
                  type="text" 
                  value={prodSku} 
                  onChange={(e) => setProdSku(e.target.value)}
                  className="w-full p-2 border border-brand-silver dark:border-brand-grey bg-transparent text-xs rounded outline-none" 
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] font-display font-bold uppercase tracking-widest text-neutral-500 mb-1">Base Price (INR)</label>
                <input 
                  type="number" 
                  value={prodPrice} 
                  onChange={(e) => setProdPrice(e.target.value)}
                  className="w-full p-2 border border-brand-silver dark:border-brand-grey bg-transparent text-xs rounded outline-none" 
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] font-display font-bold uppercase tracking-widest text-neutral-500 mb-1">Sale Price (Optional)</label>
                <input 
                  type="number" 
                  value={prodSalePrice} 
                  onChange={(e) => setProdSalePrice(e.target.value)}
                  className="w-full p-2 border border-brand-silver dark:border-brand-grey bg-transparent text-xs rounded outline-none" 
                />
              </div>
              {/* Category & Subcategory Selection */}
              <div>
                <label className="block text-[9px] font-display font-bold uppercase tracking-widest text-neutral-500 mb-1">Main Category</label>
                <select
                  value={prodCategory}
                  onChange={(e) => setProdCategory(e.target.value)}
                  className="w-full p-2 border border-brand-silver dark:border-brand-grey bg-transparent text-xs rounded outline-none font-display uppercase tracking-widest font-semibold"
                >
                  <option value="T-Shirts">T-Shirts (All)</option>
                  <option value="Hoodies">Hoodies & Fleece</option>
                  <option value="Outerwear">Outerwear & Jackets</option>
                  <option value="Bottoms">Bottoms & Pants</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-display font-bold uppercase tracking-widest text-neutral-500 mb-1">Subcategory / Collection Cut</label>
                <select
                  value={prodSubcategory}
                  onChange={(e) => setProdSubcategory(e.target.value)}
                  className="w-full p-2 border border-brand-silver dark:border-brand-grey bg-transparent text-xs rounded outline-none font-display uppercase tracking-widest font-semibold"
                >
                  <option value="Oversized">Oversized Heavyweight (280-320 GSM)</option>
                  <option value="Acid Wash">Acid Wash Relic (Vintage Distressed)</option>
                  <option value="Graphic">Graphic & Typography</option>
                  <option value="Minimalist">Minimalist Core Plain</option>
                  <option value="Boxy Fit">Boxy Fit Drop-Shoulder</option>
                </select>
              </div>

              {/* Product Color Selection */}
              <div className="sm:col-span-2 p-4 border border-brand-silver dark:border-brand-grey rounded bg-neutral-50/50 dark:bg-neutral-900/30 space-y-3">
                <label className="block text-[10px] font-display font-extrabold uppercase tracking-widest text-brand-black dark:text-white">
                  PRODUCT COLOR SPECIFICATION
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[8px] font-display font-bold uppercase tracking-widest text-neutral-400 mb-1">Color Name (e.g. Pitch Black, Chalk White)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Pitch Black" 
                      value={prodColorName} 
                      onChange={(e) => setProdColorName(e.target.value)}
                      className="w-full p-2 border border-brand-silver dark:border-brand-grey bg-transparent text-xs rounded outline-none font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-display font-bold uppercase tracking-widest text-neutral-400 mb-1">Color Hex Code / Picker</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={prodColorHex} 
                        onChange={(e) => setProdColorHex(e.target.value)}
                        className="w-9 h-9 p-0 border-0 rounded cursor-pointer bg-transparent"
                      />
                      <input 
                        type="text" 
                        value={prodColorHex} 
                        onChange={(e) => setProdColorHex(e.target.value)}
                        className="flex-1 p-2 border border-brand-silver dark:border-brand-grey bg-transparent text-xs rounded outline-none uppercase font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Swatch Presets */}
                <div>
                  <label className="block text-[8px] font-display font-bold uppercase tracking-widest text-neutral-400 mb-1.5">Quick Color Presets (1-Click Selection)</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'Chalk White', hex: '#F9F6F0' },
                      { name: 'Pitch Black', hex: '#0B0B0B' },
                      { name: 'Light Green', hex: '#90EE90' },
                      { name: 'Olive Drab', hex: '#556B2F' },
                      { name: 'Platinum Grey', hex: '#E5E4E2' },
                      { name: 'Telemagenta', hex: '#CF3476' },
                      { name: 'Orange', hex: '#FF6600' },
                      { name: 'Red', hex: '#E63946' },
                      { name: 'Night Blue', hex: '#001F3F' }
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setProdColorName(preset.name);
                          setProdColorHex(preset.hex);
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-display font-bold uppercase tracking-widest border rounded transition-all ${
                          prodColorName === preset.name ? 'border-brand-black dark:border-white bg-brand-black/10 dark:bg-white/10' : 'border-brand-silver dark:border-brand-grey hover:border-neutral-500'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: preset.hex }} />
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Per-Size Inventory Breakdown */}
              <div className="sm:col-span-2 p-4 border border-brand-silver dark:border-brand-grey rounded bg-neutral-50/50 dark:bg-neutral-900/30">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-[10px] font-display font-extrabold uppercase tracking-widest text-brand-black dark:text-white">
                    SIZE-WISE INVENTORY (PIECES PER SIZE)
                  </label>
                  <span className="text-[10px] font-display font-bold uppercase tracking-widest text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
                    Total Stock: {(Number(stockS) || 0) + (Number(stockM) || 0) + (Number(stockL) || 0) + (Number(stockXL) || 0) + (Number(stockXXL) || 0)} Pcs
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  <div>
                    <label className="block text-[8px] font-display font-bold uppercase tracking-widest text-neutral-400 mb-1 text-center">S</label>
                    <input 
                      type="number" 
                      min="0"
                      value={stockS} 
                      onChange={(e) => setStockS(e.target.value)}
                      className="w-full p-2 text-center border border-brand-silver dark:border-brand-grey bg-transparent text-xs font-bold rounded outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-display font-bold uppercase tracking-widest text-neutral-400 mb-1 text-center">M</label>
                    <input 
                      type="number" 
                      min="0"
                      value={stockM} 
                      onChange={(e) => setStockM(e.target.value)}
                      className="w-full p-2 text-center border border-brand-silver dark:border-brand-grey bg-transparent text-xs font-bold rounded outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-display font-bold uppercase tracking-widest text-neutral-400 mb-1 text-center">L</label>
                    <input 
                      type="number" 
                      min="0"
                      value={stockL} 
                      onChange={(e) => setStockL(e.target.value)}
                      className="w-full p-2 text-center border border-brand-silver dark:border-brand-grey bg-transparent text-xs font-bold rounded outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-display font-bold uppercase tracking-widest text-neutral-400 mb-1 text-center">XL</label>
                    <input 
                      type="number" 
                      min="0"
                      value={stockXL} 
                      onChange={(e) => setStockXL(e.target.value)}
                      className="w-full p-2 text-center border border-brand-silver dark:border-brand-grey bg-transparent text-xs font-bold rounded outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-display font-bold uppercase tracking-widest text-neutral-400 mb-1 text-center">XXL</label>
                    <input 
                      type="number" 
                      min="0"
                      value={stockXXL} 
                      onChange={(e) => setStockXXL(e.target.value)}
                      className="w-full p-2 text-center border border-brand-silver dark:border-brand-grey bg-transparent text-xs font-bold rounded outline-none" 
                    />
                  </div>
                </div>
              </div>

              {/* 5 Optional Product Image Slots */}
              <div className="sm:col-span-2 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-display font-extrabold uppercase tracking-widest text-brand-black dark:text-white">
                    PRODUCT PHOTOS (UP TO 5 PHOTOS - OPTIONAL 2-5)
                  </label>
                  <span className="text-[9px] font-display text-neutral-400 uppercase tracking-widest">
                    {[prodImg1, prodImg2, prodImg3, prodImg4, prodImg5].filter(x => x.trim()).length} / 5 Added
                  </span>
                </div>

                {[
                  { label: 'Photo 1 (Main Cover Photo * Required)', val: prodImg1, set: setProdImg1, id: 'img1' },
                  { label: 'Photo 2 (Optional Back View)', val: prodImg2, set: setProdImg2, id: 'img2' },
                  { label: 'Photo 3 (Optional Detail Cut)', val: prodImg3, set: setProdImg3, id: 'img3' },
                  { label: 'Photo 4 (Optional Model Fit)', val: prodImg4, set: setProdImg4, id: 'img4' },
                  { label: 'Photo 5 (Optional Wash / Texture)', val: prodImg5, set: setProdImg5, id: 'img5' }
                ].map((slot, idx) => (
                  <div key={slot.id} className="p-2 border border-brand-silver/60 dark:border-brand-grey/60 rounded flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] font-display font-bold uppercase tracking-widest text-neutral-500">{slot.label}</span>
                      {slot.val && <span className="text-[8px] font-bold text-green-500 uppercase">✓ Added</span>}
                    </div>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="url" 
                        placeholder={`Image URL ${idx + 1}`}
                        value={slot.val} 
                        onChange={(e) => slot.set(e.target.value)}
                        className="flex-1 p-2 border border-brand-silver dark:border-brand-grey bg-transparent text-xs rounded outline-none" 
                      />
                      <label
                        htmlFor={`upload-${slot.id}`}
                        className="cursor-pointer px-2.5 py-2 text-[8px] font-display font-bold uppercase tracking-widest border border-brand-black dark:border-white text-brand-black dark:text-white hover:bg-brand-black hover:text-white dark:hover:bg-white dark:hover:text-brand-black rounded transition-colors whitespace-nowrap"
                      >
                        Upload
                      </label>
                      <input
                        id={`upload-${slot.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingImage(true);
                          setUploadError('');
                          try {
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                              const base64 = reader.result;
                              try {
                                const res = await fetch(`${API_URL}/admin/upload`, {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                  },
                                  body: JSON.stringify({ image: base64 })
                                });
                                const data = await res.json();
                                if (data.success && data.url) {
                                  slot.set(data.url);
                                } else {
                                  slot.set(base64);
                                }
                              } catch (err) {
                                slot.set(base64);
                              } finally {
                                setUploadingImage(false);
                              }
                            };
                            reader.readAsDataURL(file);
                          } catch (err) {
                            setUploadingImage(false);
                          }
                          e.target.value = '';
                        }}
                      />
                      {slot.val && (
                        <img src={slot.val} alt={`Slot ${idx + 1}`} className="h-9 w-9 object-cover rounded border border-brand-silver dark:border-brand-grey flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[9px] font-display font-bold uppercase tracking-widest text-neutral-500 mb-1">Description</label>
                <textarea 
                  value={prodDescription} 
                  onChange={(e) => setProdDescription(e.target.value)}
                  className="w-full p-3 border border-brand-silver dark:border-brand-grey bg-transparent text-xs rounded h-24 outline-none" 
                  required
                />
              </div>
              <div className="sm:col-span-2 pt-4 flex space-x-3 text-xs font-display font-bold uppercase tracking-widest">
                <button type="submit" className="flex-grow py-3 bg-brand-black dark:bg-white text-white dark:text-brand-black">
                  Publish Item
                </button>
                <button type="button" onClick={() => setShowAddProductModal(false)} className="px-6 py-3 border border-brand-silver dark:border-brand-grey text-neutral-500">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Coupon Modal */}
      {showAddCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-brand-charcoal border border-brand-silver dark:border-brand-grey p-8 rounded w-full max-w-md shadow-2xl">
            <h3 className="font-display font-extrabold text-lg uppercase tracking-widest mb-6">Create New Coupon Campaign</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs font-display font-bold uppercase">
              <div>
                <label className="block text-[9px] tracking-widest text-neutral-500 mb-1">Coupon Code</label>
                <input 
                  type="text" 
                  placeholder="MEGA50" 
                  value={coupCode} 
                  onChange={(e) => setCoupCode(e.target.value.toUpperCase())}
                  className="w-full p-2 border border-brand-silver dark:border-brand-grey bg-transparent tracking-widest outline-none uppercase" 
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] tracking-widest text-neutral-500 mb-1">Discount Type</label>
                <select
                  value={coupType}
                  onChange={(e) => setCoupType(e.target.value)}
                  className="w-full p-2 border border-brand-silver dark:border-brand-grey bg-transparent tracking-wider outline-none"
                >
                  <option value="percentage">Percentage Discount (%)</option>
                  <option value="flat">Flat Cash Discount (₹)</option>
                  <option value="free_shipping">Free Shipping Promotion</option>
                </select>
              </div>
              {coupType !== 'free_shipping' && (
                <div>
                  <label className="block text-[9px] tracking-widest text-neutral-500 mb-1">Discount Value</label>
                  <input 
                    type="number" 
                    value={coupValue} 
                    onChange={(e) => setCoupValue(e.target.value)}
                    className="w-full p-2 border border-brand-silver dark:border-brand-grey bg-transparent outline-none" 
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-[9px] tracking-widest text-neutral-500 mb-1">Minimum Order Amount (₹)</label>
                <input 
                  type="number" 
                  value={coupMinOrder} 
                  onChange={(e) => setCoupMinOrder(e.target.value)}
                  className="w-full p-2 border border-brand-silver dark:border-brand-grey bg-transparent outline-none" 
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] tracking-widest text-neutral-500 mb-1">Usage Limit (How Many Users / Uses)</label>
                <input 
                  type="number" 
                  placeholder="100"
                  value={coupUsageLimit} 
                  onChange={(e) => setCoupUsageLimit(e.target.value)}
                  className="w-full p-2 border border-brand-silver dark:border-brand-grey bg-transparent outline-none" 
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] tracking-widest text-neutral-500 mb-1">Expiry Date</label>
                <input 
                  type="date" 
                  value={coupExpiry} 
                  onChange={(e) => setCoupExpiry(e.target.value)}
                  className="w-full p-2 border border-brand-silver dark:border-brand-grey bg-transparent outline-none" 
                  required
                />
              </div>
              <div className="pt-4 flex space-x-3 text-xs tracking-widest">
                <button type="submit" className="flex-grow py-3 bg-brand-black dark:bg-white text-white dark:text-brand-black">
                  Save Coupon
                </button>
                <button type="button" onClick={() => setShowAddCouponModal(false)} className="px-6 py-3 border border-brand-silver dark:border-brand-grey text-neutral-500">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 3. Full Order Dispatch & Customer Address Modal */}
      {selectedOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-brand-charcoal border border-brand-silver dark:border-brand-grey p-6 sm:p-8 rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-brand-silver dark:border-brand-grey pb-4 mb-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 font-bold block">
                  OFFICIAL DISPATCH SLIP
                </span>
                <h3 className="font-display font-extrabold text-xl uppercase text-brand-black dark:text-white mt-1">
                  ORDER #{selectedOrderModal._id}
                </h3>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">
                  Placed on: {new Date(selectedOrderModal.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => { setSelectedOrderModal(null); setCopiedText(false); }}
                className="p-2 border border-neutral-700 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              
              {/* Customer Contact & Address Box */}
              <div className="p-5 bg-neutral-100 dark:bg-neutral-900 border border-brand-silver dark:border-brand-grey rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-display text-xs font-bold uppercase tracking-widest text-neutral-400 flex items-center">
                    <MapPin size={14} className="mr-1.5 text-emerald-500" />
                    Customer Delivery Address & Contact
                  </h4>
                  <button
                    onClick={() => {
                      const addr = selectedOrderModal.shippingAddress || {};
                      const textToCopy = `CUSTOMER: ${addr.name || selectedOrderModal.user?.name}
PHONE: ${addr.phone || selectedOrderModal.user?.phone}
ADDRESS: ${addr.street}, ${addr.city}, ${addr.state} - ${addr.pincode} (Landmark: ${addr.landmark || 'N/A'})`;
                      navigator.clipboard.writeText(textToCopy);
                      setCopiedText(true);
                      setTimeout(() => setCopiedText(false), 2000);
                    }}
                    className="px-3 py-1 bg-brand-black dark:bg-white text-white dark:text-brand-black font-display font-bold text-[10px] uppercase rounded flex items-center space-x-1 hover:opacity-90 transition"
                  >
                    <Copy size={12} />
                    <span>{copiedText ? '✓ Copied Address!' : 'Copy Full Address'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                  <div>
                    <span className="text-[10px] font-display font-bold uppercase text-neutral-400 block">Customer Name</span>
                    <p className="font-bold text-sm text-brand-black dark:text-white mt-0.5">
                      {selectedOrderModal.shippingAddress?.name || selectedOrderModal.user?.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-display font-bold uppercase text-neutral-400 block">Phone Number (Mandatory)</span>
                    <p className="font-mono font-extrabold text-base text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center">
                      <Phone size={14} className="mr-1" />
                      {selectedOrderModal.shippingAddress?.phone || selectedOrderModal.user?.phone || 'No phone provided'}
                    </p>
                  </div>
                  <div className="sm:col-span-2 border-t border-neutral-200 dark:border-neutral-800 pt-3">
                    <span className="text-[10px] font-display font-bold uppercase text-neutral-400 block mb-1">Full Delivery Address (Untruncated)</span>
                    <div className="p-3 bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 rounded font-sans text-xs text-brand-black dark:text-neutral-100 font-medium whitespace-pre-wrap break-words leading-relaxed">
                      {selectedOrderModal.shippingAddress?.street || 'No street details'}
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-2 text-xs font-bold text-brand-black dark:text-white">
                      <span className="px-2.5 py-1 bg-neutral-200 dark:bg-neutral-800 rounded">City: {selectedOrderModal.shippingAddress?.city}</span>
                      <span className="px-2.5 py-1 bg-neutral-200 dark:bg-neutral-800 rounded">State: {selectedOrderModal.shippingAddress?.state}</span>
                      <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded font-mono">Pincode: {selectedOrderModal.shippingAddress?.pincode}</span>
                    </div>
                    {selectedOrderModal.shippingAddress?.landmark && (
                      <p className="text-xs text-amber-500 font-medium mt-2">
                        📍 Landmark / Near: {selectedOrderModal.shippingAddress?.landmark}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items Breakdown */}
              <div>
                <h4 className="font-display text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3 flex items-center">
                  <Package size={14} className="mr-1.5" />
                  Ordered Items ({selectedOrderModal.items?.length || 0})
                </h4>
                <div className="divide-y divide-brand-silver dark:divide-brand-grey border border-brand-silver dark:border-brand-grey rounded-lg overflow-hidden">
                  {selectedOrderModal.items?.map((item, i) => (
                    <div key={i} className="p-3 flex items-center justify-between bg-white dark:bg-brand-charcoal">
                      <div className="flex items-center space-x-3">
                        <img src={item.image} alt="" className="w-12 h-14 object-cover rounded border border-neutral-800" />
                        <div>
                          <p className="font-display font-bold text-xs">{item.name}</p>
                          <div className="flex items-center space-x-3 text-[11px] text-neutral-400 font-mono mt-1">
                            <span>Size: <strong className="text-white">{item.size}</strong></span>
                            <span>Color: <strong className="text-white">{item.color?.name}</strong></span>
                            <span>Qty: <strong className="text-white">{item.quantity}</strong></span>
                          </div>
                        </div>
                      </div>
                      <span className="font-display font-extrabold text-sm text-brand-black dark:text-white">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Payment Footer */}
              <div className="p-4 bg-brand-platinum/60 dark:bg-neutral-900 border border-brand-silver dark:border-brand-grey rounded-lg flex flex-col sm:flex-row justify-between items-center font-display gap-3">
                <div>
                  <span className="text-[10px] text-neutral-400 font-bold uppercase block">Payment Method</span>
                  <span className="text-xs font-extrabold uppercase text-amber-400">
                    {selectedOrderModal.paymentMethod === 'cod' ? '💵 Cash on Delivery (Collect Cash)' : '💳 Prepaid Online'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase block">Total Collectible Amount</span>
                  <span className="text-xl font-extrabold text-brand-black dark:text-white">
                    ₹{selectedOrderModal.totalAmount}
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
