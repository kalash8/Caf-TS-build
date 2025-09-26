// app/vendor/orders/page.js
"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import OrderCard from '../../../components/OrderCard';
import NavbarVendor from '../../../components/NavbarVendor';
import { useRouter } from 'next/navigation';

export default function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/vendor/login');
      return;
    }

    const decoded = jwtDecode(token);
    if (decoded.role !== 'vendor') {
      alert('Access denied. Login as vendor.');
      localStorage.removeItem('token');
      router.push('/vendor/login');
      return;
    }

    axios.get('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setOrders(res.data));
  }, []);

  const updateStatus = async (id, status) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.put(`/api/orders?id=${id}`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      setOrders(orders.map(o => o._id === id ? res.data : o));
    } catch (err) {
      alert('Update failed');
    }
  };

  return (
    <div>
      <NavbarVendor />
      <div className="p-4 pt-20">
        <h1 className="text-2xl mb-4">Manage Orders</h1>
        {orders.map(order => (
          <div key={order._id} className="bg-white p-4 m-2 rounded shadow">
            <OrderCard order={order} />
            <select value={order.status} onChange={(e) => updateStatus(order._id, e.target.value)} className="ml-4 p-1 border">
              <option>Received</option>
              <option>Preparing</option>
              <option>Ready</option>
              <option>Completed</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}