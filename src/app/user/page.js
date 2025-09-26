// app/user/page.js
"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import NavbarUser from '../../components/NavbarUser';

export default function UserMenu() {
  const [items, setItems] = useState([]);
  const [groupedItems, setGroupedItems] = useState({});
  const [vendors, setVendors] = useState([]);
  const [openVendors, setOpenVendors] = useState(new Set());
  const [selected, setSelected] = useState([]);
  const [pickupTime, setPickupTime] = useState(new Date());
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/user/login');
      return;
    }

    const decoded = jwtDecode(token);
    if (decoded.role !== 'user') {
      alert('Access denied. Login as user.');
      localStorage.removeItem('token');
      router.push('/user/login');
      return;
    }

    axios.get('/api/vendors', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setVendors(res.data));

    const today = new Date().toISOString().split('T')[0];
    axios.get(`/api/menu?date=${today}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setItems(res.data);
      const grouped = res.data.reduce((acc, item) => {
        const vid = item.vendorId._id;
        if (!acc[vid]) acc[vid] = [];
        acc[vid].push(item);
        return acc;
      }, {});
      setGroupedItems(grouped);
    });
  }, []);

  const toggleVendor = (id) => {
    setOpenVendors((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const addToOrder = (item) => {
    const existing = selected.find(s => s.menuItemId === item._id);
    if (existing) {
      existing.quantity += 1;
      setSelected([...selected]);
    } else {
      setSelected([...selected, { menuItemId: item._id, quantity: 1 }]);
    }
  };

  const calculateTotal = () => {
    return selected.reduce((sum, sel) => {
      const item = items.find(i => i._id === sel.menuItemId);
      return sum + (item ? item.price * sel.quantity : 0);
    }, 0);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const token = localStorage.getItem('token');
    const total = calculateTotal();
    if (total === 0 || selected.length === 0) return alert('Select items');

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) return alert('Razorpay SDK failed to load');

      const { data: { key } } = await axios.get('/api/payment/key', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { data: { orderId, amount } } = await axios.post('/api/payment/create-order', { amount: total }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const options = {
        key,
        amount,
        currency: 'INR',
        name: 'Cafeteria App',
        description: 'Pre-order payment',
        order_id: orderId,
        handler: async (response) => {
          try {
            const verifyRes = await axios.post('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items: selected,
              pickupTime,
              total
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            alert('Payment successful! Order created.');
            router.push('/user/track');
          } catch (err) {
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: 'User',
          email: localStorage.getItem('email') || 'user@cafeteria.com'
        },
        theme: { color: '#3399cc' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert('Payment initiation failed');
    }
  };

  return (
    <div>
      <NavbarUser />
      <div className="p-4 pt-20">
        <h1 className="text-2xl mb-4">Today's Menu</h1>
        {vendors.map(vendor => (
          <div key={vendor._id} className="mb-4">
            <button
              className="bg-blue-200 p-2 w-full text-left rounded font-bold"
              onClick={() => toggleVendor(vendor._id)}
            >
              {vendor.name} Stall {openVendors.has(vendor._id) ? '-' : '+'}
            </button>
            {openVendors.has(vendor._id) && (
              <div className="mt-2">
                {(groupedItems[vendor._id] || []).length > 0 ? (
                  groupedItems[vendor._id].map(item => (
                    <div key={item._id} className="bg-white p-4 m-2 rounded shadow flex justify-between items-center">
                      <div>
                        <h3 className="font-bold">{item.name}</h3>
                        <p>{item.description}</p>
                        <p className="text-green-600">₹{item.price}</p>
                      </div>
                      <button onClick={() => addToOrder(item)} className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No items available today from this stall.</p>
                )}
              </div>
            )}
          </div>
        ))}
        <div className="mt-4">
          <label className="block mb-2">Pickup Time:</label>
          <input type="datetime-local" value={pickupTime.toISOString().slice(0,16)} onChange={(e) => setPickupTime(new Date(e.target.value))} className="w-full p-2 mb-4 border rounded" required />
        </div>
        {selected.length > 0 && (
          <div className="bg-white p-4 rounded shadow">
            <p>Selected: {selected.length} items | Total: ₹{calculateTotal().toFixed(2)}</p>
            <button onClick={handlePayment} className="w-full bg-green-600 text-white p-2 mt-2 rounded">Pre-Order & Pay via UPI</button>
          </div>
        )}
      </div>
    </div>
  );
}