// app/user/track/page.js
"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import OrderCard from '../../../components/OrderCard';
import NavbarUser from '../../../components/NavbarUser';
import { useRouter } from 'next/navigation';

export default function Track() {
  const [orders, setOrders] = useState([]);
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

    axios.get('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setOrders(res.data));
  }, []);

  return (
    <div>
      <NavbarUser />
      <div className="p-4 pt-20">
        <h1 className="text-2xl mb-4">Track Orders</h1>
        {orders.map(order => <OrderCard key={order._id} order={order} />)}
      </div>
    </div>
  );
}