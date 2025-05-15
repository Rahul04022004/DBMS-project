import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link'; // For linking to the login page
import { Geist } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(''); // For success or error messages
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setMessage(''); // Clear previous messages
    setIsLoading(true);

    if (!username || !password) {
      setMessage('Username and password are required.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
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
          action: 'register',
          username,
          password,
        }),
      });

      const data = await response.json();

        if (response.ok) {
            localStorage.setItem('loginUsername',document.getElementById('username').value)
        setMessage(data.message + " You will be redirected to login shortly.");
        // Optionally clear form or redirect
        setTimeout(() => {
          router.push('/test'); // Redirect to login page (index.js)
        }, 2000); // Redirect after 3 seconds
      } else {
        setMessage(data.message || 'Failed to register. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={`flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground ${geistSans.variable} font-sans`}>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            Create Your Account
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link href="/" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form onSubmit={handleRegister} className="p-8 shadow-xl rounded-lg bg-white dark:bg-gray-800 space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-700 dark:text-gray-300">Username</label>
            <div className="mt-2">
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-50"
                placeholder="Choose a username"
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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-50"
                placeholder="Create a password"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-700 dark:text-gray-300">Confirm Password</label>
            <div className="mt-2">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-50"
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>
          
          {message && (
            <p className={`text-sm ${message.includes('successfully') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-700 text-white p-3 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-600 dark:hover:bg-gray-500 disabled:opacity-50"
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </main>
  );
}