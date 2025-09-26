// app/vendor/register/page.js
"use client";
import { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff } from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// import bg from '../../../public/Assets/corpbg.png';

export default function VendorRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/register', { name, email, password, role: 'vendor' });
      localStorage.setItem('token', res.data.token);
      router.push('/vendor');
    } catch (err) {
      alert(err.response?.data?.msg || 'Error');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-end">
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-sm scale-105"
        // style={{ backgroundImage: `url(${bg.src})` }}
      ></div>
      <div className="absolute inset-0 bg-black opacity-30"></div>
      <div className="relative w-full max-w-md p-6 bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-lg m-6 z-10">
        <h2 className="text-3xl font-semibold text-center mb-6">REGISTER</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium p-3 rounded-lg transition"
          >
            Register
          </button>
          <p className="mt-4 text-center text-gray-600">
            Already have an account? <Link href="/vendor/login" className="text-blue-500 hover:underline">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}