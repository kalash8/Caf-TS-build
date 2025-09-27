// components/NavbarVendor.js
"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import logo from '../Assets/logo.png';

const NavbarVendor = () => {
  const router = useRouter();
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  const [isOpen, setIsOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/vendor/login');
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 p-4 text-white flex justify-between items-center shadow-md"
      style={{ backgroundColor: '#003D5D', borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px' }}
    >
      <div className="flex justify-center w-full md:w-auto md:ml-8">
        <Link href="/vendor" className="flex items-center space-x-2">
          <img src={logo.src} alt="Logo" className="h-6 w-auto sm:h-8 md:h-10" />
          <span className="text-sm sm:text-lg md:text-2xl font-bold mt-1">| Cafe Vendor</span>
        </Link>
      </div>
      {token && (
        <div className="md:hidden ml-10 mt-3">
          <button onClick={toggleMenu} className="focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      )}
      {token && (
        <>
          <div className="hidden md:flex mr-8 space-x-4">
            <Link href="/vendor" className="hover:underline">Menu</Link>
            <Link href="/vendor/orders" className="hover:underline">Orders</Link>
            <Link href="/vendor/profile" className="hover:underline">Profile</Link>
            <button onClick={logout} className="hover:underline">Logout</button>
          </div>
          <div className={`md:hidden absolute top-14 left-64 right-0 bg-[#003D5D] shadow-md rounded-b-xl ${isOpen ? 'block' : 'hidden'} opacity-80`}>
            <div className="flex flex-col items-center py-4">
              <Link href="/vendor" className="py-2 hover:underline opacity-100" onClick={() => setIsOpen(false)}>Menu</Link>
              <Link href="/vendor/orders" className="py-2 hover:underline opacity-100" onClick={() => setIsOpen(false)}>Orders</Link>
              <Link href="/vendor/profile" className="py-2 hover:underline opacity-100" onClick={() => setIsOpen(false)}>Profile</Link>
              <button onClick={logout} className="py-2 hover:underline opacity-100">Logout</button>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default NavbarVendor;