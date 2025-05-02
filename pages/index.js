import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function LandingPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const router = useRouter();

  const handleLogin = () => {
    if (role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/test');
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Login</h1>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Username</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-3 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full p-3 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button onClick={handleLogin} className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">Login</button>
    </div>
  );
}
