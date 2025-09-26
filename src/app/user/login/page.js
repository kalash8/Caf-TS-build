// app/user/login/page.js
"use client";
import { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff } from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UserLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      if (res.data.role === 'user') {
        router.push('/user');
      } else {
        alert('Invalid role for this app');
      }
    } catch (err) {
      alert(err.response?.data?.msg || 'Error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="lg:w-1/2 relative">
        <div
          className="hidden lg:block h-full w-full bg-cover bg-center"
          style={{ backgroundImage: "url('/Assets/desktop-bg.png')" }}
        ></div>
        <div
          className="block lg:hidden h-48 bg-cover bg-center"
          style={{ backgroundImage: "url('/Assets/mobile-bg.png')" }}
        ></div>
      </div>
      <div className="flex items-center justify-center lg:w-1/2 p-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md p-6 bg-white rounded-2xl shadow"
        >
          <h2 className="text-3xl font-semibold text-center mb-6">Login</h2>
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
            Login
          </button>
          <p className="mt-4 text-center text-gray-600">
            Don’t have an account?{" "}
            <Link href="/user/register" className="text-blue-500 hover:underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}