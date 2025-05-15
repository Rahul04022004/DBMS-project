import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from "next/image";
import Link from 'next/link';
import { Geist } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function LandingPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUsername = localStorage.getItem('loginUsername');
      if (storedUsername) {
        setUsername(storedUsername);
      }
    }
  }, []);

  const handleLogin = async () => {
    setLoginError('');
    setIsLoading(true);
    let usernameToSave = "";

    if (typeof window !== 'undefined') {
      usernameToSave = username.trim();
      if (usernameToSave !== '') {
        localStorage.setItem('loginUsername', usernameToSave);
      } else {
        localStorage.removeItem('loginUsername');
      }
    }

    if (usernameToSave === '') {
      setLoginError('Username is required.');
      setIsLoading(false);
      return;
    }
    if (password === '') {
        setLoginError('Password is required.');
        setIsLoading(false);
        return;
    }

    try {
      const response = await fetch('/api/health', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'recordLogin',
          username: usernameToSave,
        }),
      });

      const data = await response.json();

      if (!response.ok || (data.message && data.message.toLowerCase().includes('user not found'))) {
        setLoginError(data.message || 'Login failed. Please check your username.');
        setIsLoading(false);
        return;
      } else {
        console.log('Login recorded:', data.message);
        if (role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/test');
        }
      }
    } catch (error) {
      console.error('Error during login attempt:', error);
      setLoginError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <main className={`relative flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground ${geistSans.variable} font-sans pt-20 md:pt-16`}>
      
      <div className="fixed top-4 right-4 z-20">
        <Link href="/admin" legacyBehavior>
          <a className="px-4 py-2 bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 text-white text-sm font-medium rounded-md shadow-md transition-colors">
            Admin Panel
          </a>
        </Link>
      </div>

      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            Welcome to Your Health & Wellbeing Hub
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
            <div className="text-4xl mb-4 text-center text-indigo-500 dark:text-indigo-400">
              📊
            </div>
            <h3 className="text-xl font-semibold mb-2 text-center text-gray-900 dark:text-gray-50">
              Comprehensive Tracking
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
              Log your steps, sleep patterns, water intake, and daily mood with ease.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
            <div className="text-4xl mb-4 text-center text-indigo-500 dark:text-indigo-400">
              📈
            </div>
            <h3 className="text-xl font-semibold mb-2 text-center text-gray-900 dark:text-gray-50">
              Progress Monitoring
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
              Visualize your health journey with intuitive charts and weekly trend reports.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
            <div className="text-4xl mb-4 text-center text-indigo-500 dark:text-indigo-400">
              💡
            </div>
            <h3 className="text-xl font-semibold mb-2 text-center text-gray-900 dark:text-gray-50">
              Personalized Insights
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
              Receive suggestions and detect anomalies to better understand your wellbeing.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
            <div className="text-4xl mb-4 text-center text-indigo-500 dark:text-indigo-400">
              ❤️
            </div>
            <h3 className="text-xl font-semibold mb-2 text-center text-gray-900 dark:text-gray-50">
              Build Healthy Habits
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
              Stay motivated and consistent in forming habits that last a lifetime.
            </p>
          </div>
        </div>

        <div className="p-8 shadow-xl rounded-lg bg-white dark:bg-gray-800 space-y-6">
          <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-gray-100">Login to Your Account</h2>
          
          {loginError && (
            <p className="text-sm text-red-600 dark:text-red-400 text-center bg-red-100 dark:bg-red-900 dark:bg-opacity-30 p-3 rounded-md">
              {loginError}
            </p>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-700 dark:text-gray-300">Username</label>
            <div className="mt-2">
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setLoginError(''); }}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-50"
                placeholder="yourusername"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-700 dark:text-gray-300">Password</label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setLoginError(''); }}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-50"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium leading-6 text-gray-700 dark:text-gray-300">Role</label>
            <div className="mt-2">
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-50"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-gray-700 text-white p-3 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-600 dark:hover:bg-gray-500 disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link href="/register" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
