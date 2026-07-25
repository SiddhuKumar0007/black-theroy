"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Truck, CheckCircle2, XCircle, Printer, HelpCircle } from 'lucide-react';
import { useAuth, API_URL } from '../../context/AuthContext';

const mockFallbackOrders = [
  {
    _id: 'ord_mock_111',
    createdAt: '2026-07-10T12:00:00.000Z',
    totalAmount: 3898,
    paymentMethod: 'card',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    paymentGateway: 'stripe',
    courierTracking: 'BT-BLU-7890123',
    courierName: 'Bluedart Express',
    items: [
      {
        product: 'fallback-1',
        name: 'Obsidian Heavyweight Oversized Tee',
        price: 1999,
        quantity: 1,
        size: 'L',
        color: { name: 'Pitch Black', hex: '#0B0B0B' },
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600'
      },
      {
        product: 'fallback-3',
        name: 'Spectral Chalk White Hoodie',
        price: 3899,
        quantity: 1,
        size: 'M',
        color: { name: 'Chalk White', hex: '#F9F6F0' },
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600'
      }
    ]
  }
];

export default function Orders() {
  const router = useRouter();
  const { isAuthenticated, token, loading: authLoading } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchOrders = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/orders/myorders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      } else {
        setOrders(mockFallbackOrders);
      }
    } catch (err) {
      setOrders(mockFallbackOrders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=orders');
    } else {
      fetchOrders();
    }
  }, [isAuthenticated, authLoading, token]);

  const handleCancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to request cancellation for this order?')) return;
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Order cancelled successfully. Stock restored.');
        fetchOrders();
      } else {
        alert(data.message || 'Failed to cancel order');
      }
    } catch (err) {
      console.error(err);
      alert('Error communicating with cancellation servers.');
    }
  };

  const handlePrintInvoice = (order) => {
    // Generate simple readable layout and trigger print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>BLACK THEORY INVOICE - ${order._id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #111; }
            .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
            h1 { font-size: 24px; letter-spacing: 4px; text-transform: uppercase; margin: 0; }
            .meta { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin-top: 5px; }
            .bill-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-bottom: 40px; font-size: 12px; }
            .bill-title { font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { text-align: left; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; border-bottom: 2px solid #000; padding: 10px 0; }
            td { padding: 15px 0; border-bottom: 1px solid #eee; font-size: 12px; }
            .total-row { font-weight: bold; border-top: 2px solid #000; }
            .footer { border-top: 1px solid #eee; padding-top: 20px; font-size: 10px; color: #999; text-align: center; text-transform: uppercase; letter-spacing: 1px; margin-top: 80px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>BLACK THEORY</h1>
              <div class="meta">TAX INVOICE / RECEIPT</div>
            </div>
            <div style="text-align: right; font-size: 12px;">
              <strong>ORDER ID:</strong> ${order._id}<br/>
              <strong>DATE:</strong> ${new Date(order.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div class="bill-grid">
            <div>
              <div class="bill-title">Billing Address</div>
              ${order.billingAddress ? `
                ${order.billingAddress.name}<br/>
                ${order.billingAddress.street}<br/>
                ${order.billingAddress.city}, ${order.billingAddress.state} - ${order.billingAddress.pincode}<br/>
                Phone: ${order.billingAddress.phone}
              ` : 'Address details embedded in checkout'}
            </div>
            <div>
              <div class="bill-title">Shipping Address</div>
              ${order.shippingAddress ? `
                ${order.shippingAddress.name}<br/>
                ${order.shippingAddress.street}<br/>
                ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br/>
                Phone: ${order.shippingAddress.phone}
              ` : 'Address details embedded in checkout'}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Product details</th>
                <th style="text-align: center;">Size</th>
                <th style="text-align: center;">Color</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td><strong>${item.name}</strong></td>
                  <td style="text-align: center;">${item.size}</td>
                  <td style="text-align: center;">${item.color.name}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">₹${item.price * item.quantity}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="4" style="padding-top: 15px;">TOTAL AMOUNT (PAID VIA ${order.paymentMethod.toUpperCase()})</td>
                <td style="text-align: right; padding-top: 15px;">₹${order.totalAmount}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            Thank you for buying from Black Theory. For assistance, contact support@blacktheory.com
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[70vh]">
      
      {/* Title */}
      <div className="border-b border-brand-silver dark:border-brand-grey pb-6 mb-10">
        <h1 className="font-display font-extrabold text-3xl uppercase tracking-widest flex items-center">
          <ShoppingBag size={24} className="mr-2" />
          ORDER HISTORY
        </h1>
        <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">
          Monitor tracking, view receipts and manage cancellations
        </p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 text-green-600 dark:text-green-400 text-xs rounded font-display uppercase tracking-widest animate-fade-in">
          {message}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-black dark:border-white" />
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-8">
          {orders.map((ord) => (
            <div 
              key={ord._id}
              className="border border-brand-silver dark:border-brand-grey bg-white dark:bg-brand-charcoal rounded overflow-hidden shadow-sm"
            >
              {/* Header block info */}
              <div className="bg-brand-platinum dark:bg-brand-black/60 px-6 py-4 border-b border-brand-silver dark:border-brand-grey flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs font-display tracking-widest text-neutral-500 uppercase">
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  <div>
                    <span className="block text-[10px] text-neutral-400 font-bold">Placed On</span>
                    <span className="font-extrabold text-brand-black dark:text-white">{new Date(ord.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-neutral-400 font-bold">Order ID</span>
                    <span className="font-extrabold text-brand-black dark:text-white">{ord._id}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-neutral-400 font-bold">Total Amount</span>
                    <span className="font-extrabold text-brand-black dark:text-white">₹{ord.totalAmount}</span>
                  </div>
                </div>

                <div className="mt-3 sm:mt-0 flex space-x-3">
                  <button 
                    onClick={() => handlePrintInvoice(ord)}
                    className="flex items-center text-brand-black dark:text-white hover:text-neutral-500 font-bold"
                  >
                    <Printer size={12} className="mr-1" />
                    Invoice Receipt
                  </button>
                </div>
              </div>

              {/* Body: list items */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Items list detail */}
                  <div className="md:col-span-2 space-y-4">
                    {ord.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center">
                        <div className="w-14 h-16 bg-neutral-100 dark:bg-neutral-900 rounded overflow-hidden flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="ml-4">
                          <h4 className="font-display font-semibold text-xs truncate max-w-[280px]">
                            {item.name}
                          </h4>
                          <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5">
                            Size: {item.size} | Color: {item.color.name} | Qty: {item.quantity}
                          </p>
                          <p className="font-display font-bold text-xs mt-1">₹{item.price * item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Status, cancellations details */}
                  <div className="md:col-span-1 border-t md:border-t-0 md:border-l border-brand-silver dark:border-brand-grey pt-6 md:pt-0 md:pl-6 flex flex-col justify-between">
                    <div>
                      {/* Order status badges */}
                      <div className="flex items-center space-x-2 mb-4">
                        {ord.orderStatus === 'delivered' ? (
                          <CheckCircle2 size={16} className="text-green-500" />
                        ) : ord.orderStatus === 'cancelled' ? (
                          <XCircle size={16} className="text-red-500" />
                        ) : (
                          <Truck size={16} className="text-neutral-500 animate-pulse" />
                        )}
                        <span className="font-display font-bold text-xs uppercase tracking-widest text-brand-black dark:text-white">
                          Status: {ord.orderStatus}
                        </span>
                      </div>

                      {/* Courier tracking link */}
                      {ord.courierTracking && ord.orderStatus !== 'cancelled' && (
                        <div className="mb-4 text-xs font-display uppercase tracking-wider">
                          <p className="text-[9px] text-neutral-400 font-bold">Courier Tracking</p>
                          <p className="font-bold text-brand-black dark:text-white">{ord.courierName}</p>
                          <span className="font-bold underline text-neutral-500 cursor-pointer block mt-0.5">
                            {ord.courierTracking}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Cancellation Action trigger */}
                    {(ord.orderStatus === 'pending' || ord.orderStatus === 'processing') && (
                      <button
                        onClick={() => handleCancelOrder(ord._id)}
                        className="w-full py-2 bg-transparent hover:bg-red-500/10 text-red-500 border border-red-500/30 text-xs font-display font-bold uppercase tracking-widest rounded transition-colors"
                      >
                        Request Cancellation
                      </button>
                    )}
                  </div>

                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-brand-silver dark:border-brand-grey bg-brand-platinum dark:bg-brand-charcoal/50 rounded">
          <ShoppingBag size={48} className="text-neutral-300 dark:text-neutral-700 mb-4 mx-auto" />
          <h2 className="font-display font-bold text-lg mb-1">No orders placed</h2>
          <p className="text-xs text-neutral-500 max-w-[280px] leading-relaxed uppercase tracking-wider mb-6 mx-auto">
            You haven&apos;t placed any premium orders yet. Explore our latest monolith collections.
          </p>
          <button 
            onClick={() => router.push('/shop')}
            className="px-6 py-2.5 bg-brand-black dark:bg-white text-white dark:text-brand-black text-xs font-display font-bold tracking-widest uppercase hover:opacity-85"
          >
            Shop Now
          </button>
        </div>
      )}
    </div>
  );
}
