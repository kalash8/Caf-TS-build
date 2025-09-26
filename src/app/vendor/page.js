// app/vendor/page.js
"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import NavbarVendor from '../../components/NavbarVendor';

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', description: '', price: 0, date: new Date().toISOString().split('T')[0] });
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

    axios.get('/api/menu', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setItems(res.data));
  }, []);

  const addItem = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post('/api/menu', newItem, { headers: { Authorization: `Bearer ${token}` } });
      setItems([...items, res.data]);
      setNewItem({ name: '', description: '', price: 0, date: new Date().toISOString().split('T')[0] });
    } catch (err) {
      alert(err.response?.data?.msg || 'Error');
    }
  };

  return (
    <div>
      <NavbarVendor />
      <div className="p-4 pt-20">
        <h1 className="text-2xl mb-4">Menu Management</h1>
        <div className="bg-white p-4 rounded shadow mb-4">
          <input type="text" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} placeholder="Name" className="w-full p-2 mb-2 border block" />
          <input type="text" value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})} placeholder="Description" className="w-full p-2 mb-2 border block" />
          <input type="number" value={newItem.price} onChange={(e) => setNewItem({...newItem, price: e.target.value})} placeholder="Price" className="w-full p-2 mb-2 border block" />
          <input type="date" value={newItem.date} onChange={(e) => setNewItem({...newItem, date: e.target.value})} className="w-full p-2 mb-2 border block" />
          <button onClick={addItem} className="bg-green-600 text-white p-2">Add Item</button>
        </div>
        {items.map(item => (
          <div key={item._id} className="bg-white p-4 m-2 rounded shadow">
            <h3>{item.name}</h3>
            <p>{item.description} - ₹{item.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}