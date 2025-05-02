import React, { useEffect, useState } from 'react';

export default function AdminPage() {
  const [userStats, setUserStats] = useState([]);

  useEffect(() => {
    // Fetch user stats from the API
    fetch('/api/admin/user-stats')
      .then(response => response.json())
      .then(data => setUserStats(data))
      .catch(error => console.error('Error fetching user stats:', error));
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Admin Dashboard</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm leading-4 font-medium text-gray-600 uppercase tracking-wider">Username</th>
            <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm leading-4 font-medium text-gray-600 uppercase tracking-wider">Steps</th>
            <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm leading-4 font-medium text-gray-600 uppercase tracking-wider">Sleep Hours</th>
            <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm leading-4 font-medium text-gray-600 uppercase tracking-wider">Water Intake</th>
          </tr>
        </thead>
        <tbody>
          {userStats.map((user, index) => (
            <tr key={index} className="border-b border-gray-200">
              <td className="py-2 px-4 text-sm leading-5 text-gray-700">{user.username}</td>
              <td className="py-2 px-4 text-sm leading-5 text-gray-700">{user.steps}</td>
              <td className="py-2 px-4 text-sm leading-5 text-gray-700">{user.sleepHours}</td>
              <td className="py-2 px-4 text-sm leading-5 text-gray-700">{user.waterIntake}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 