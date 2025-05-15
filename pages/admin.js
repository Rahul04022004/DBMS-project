import React, { useEffect, useState } from 'react';
import { Geist } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Helper to format date strings
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};
const formatLogDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

export default function AdminPage() {
  const [allUsersData, setAllUsersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch('/api/admin/all-user-data') // Fetching from the new endpoint
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(jsonData => {
        // The new API returns { data: allUserData }
        if (jsonData && Array.isArray(jsonData.data)) {
          setAllUsersData(jsonData.data);
        } else {
          // Handle cases where data might not be in expected format
          console.warn("Received unexpected data format from API:", jsonData);
          setAllUsersData([]);
        }
      })
      .catch(fetchError => {
        console.error('Error fetching all user data:', fetchError);
        setError(fetchError.message || 'Failed to fetch data.');
        setAllUsersData([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <main className={`flex flex-col items-center min-h-screen p-4 py-8 bg-background text-foreground ${geistSans.variable} font-sans`}>
      <div className="w-full max-w-6xl space-y-8"> {/* Increased max-width for more data */}
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 mb-8 text-center">Admin Dashboard</h1>
        
        {isLoading && <p className="text-center text-gray-500 dark:text-gray-400">Loading all user data...</p>}
        {error && <p className="text-center text-red-500 dark:text-red-400">Error: {error}</p>}

        {!isLoading && !error && allUsersData.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400">No user data found.</p>
        )}

        {!isLoading && !error && allUsersData.length > 0 && (
          <div className="space-y-6">
            {allUsersData.map((user) => (
              <div key={user._id} className="p-6 shadow-xl rounded-lg bg-white dark:bg-gray-800">
                <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-3">{user.username}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mb-4 text-sm">
                  <p><strong className="font-medium text-gray-700 dark:text-gray-300">User ID:</strong> {user._id}</p>
                  <p><strong className="font-medium text-gray-700 dark:text-gray-300">Created At:</strong> {formatDate(user.createdAt)}</p>
                  <p><strong className="font-medium text-gray-700 dark:text-gray-300">Last Login:</strong> {formatDate(user.lastLoginAt)}</p>
                </div>

                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mt-4 mb-2">Health Logs ({user.healthLogs?.length || 0}):</h3>
                {user.healthLogs && user.healthLogs.length > 0 ? (
                  <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th scope="col" className="py-2 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                          <th scope="col" className="py-2 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Steps</th>
                          <th scope="col" className="py-2 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sleep (hrs)</th>
                          <th scope="col" className="py-2 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Water (L)</th>
                          <th scope="col" className="py-2 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mood</th>
                          <th scope="col" className="py-2 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Log ID</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {user.healthLogs.map((log) => (
                          <tr key={log._id}>
                            <td className="py-2 px-3 whitespace-nowrap text-xs text-gray-600 dark:text-gray-300">{formatLogDate(log.date)}</td>
                            <td className="py-2 px-3 whitespace-nowrap text-xs text-gray-600 dark:text-gray-300">{log.steps ?? 'N/A'}</td>
                            <td className="py-2 px-3 whitespace-nowrap text-xs text-gray-600 dark:text-gray-300">{log.sleepHours ?? 'N/A'}</td>
                            <td className="py-2 px-3 whitespace-nowrap text-xs text-gray-600 dark:text-gray-300">{log.waterIntake ?? 'N/A'}</td>
                            <td className="py-2 px-3 whitespace-nowrap text-xs text-gray-600 dark:text-gray-300">{log.mood ?? 'N/A'}</td>
                            <td className="py-2 px-3 whitespace-nowrap text-xs text-gray-600 dark:text-gray-300">{log._id}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">No health logs found for this user.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
} 