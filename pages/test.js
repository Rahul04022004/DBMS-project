import React, { useState, useEffect } from 'react';
import { Geist } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function TestPage() {
  const [result, setResult] = useState({});
  const [activeTestUsername, setActiveTestUsername] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUsername = localStorage.getItem('loginUsername');
      if (storedUsername) {
        setActiveTestUsername(storedUsername);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (activeTestUsername) {
        localStorage.setItem('activeTestUsername', activeTestUsername);
      } else {
        localStorage.removeItem('activeTestUsername');
      }
    }
  }, [activeTestUsername]);

  const handleResponse = async (url, options, key) => {
    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.data || `HTTP error! status: ${response.status}`);
      }
      
      let apiPayload;
      if (options?.method === 'POST') {
        apiPayload = data.message; 
      } else {
        apiPayload = data.data;
      }
      setResult(prev => ({ ...prev, [key]: apiPayload }));
      return { success: true, payload: apiPayload };
    } catch (error) {
      console.error(`Error in handleResponse for ${key}:`, error);
      const errorMessage = error.message || "An unexpected error occurred.";
      setResult(prev => ({ ...prev, [key]: `Error: ${errorMessage}` }));
      return { success: false, payload: `Error: ${errorMessage}` };
    }
  };

  const formatData = (data) => {
    if (Array.isArray(data)) {
      return (
        <ul className="list-disc pl-5">
          {data.map((item, index) => (
            <li key={index} className="mb-1">
              {typeof item === 'object' ? <pre className="whitespace-pre-wrap">{JSON.stringify(item, null, 2)}</pre> : item}
            </li>
          ))}
        </ul>
      );
    } else if (typeof data === 'object' && data !== null) {
      return (
        <div className="space-y-1">
          {Object.entries(data).map(([key, value], index) => {
            let displayValue = value;
            if (key === 'date' && value) {
              displayValue = new Date(value).toLocaleDateString();
            } else if (typeof value === 'object' && value !== null) {
              displayValue = <pre className="whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>;
            } else if (value === null) {
                displayValue = 'null';
            } else if (value === undefined) {
                displayValue = 'undefined';
            }

            return (
              <div key={index} className="text-sm">
                <strong className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</strong> {displayValue}
              </div>
            );
          })}
        </div>
      );
    }
    return <pre className="whitespace-pre-wrap">{String(data)}</pre>;
  };

  const registerUser = async () => {
    const usernameValue = document.getElementById('reg-username').value;
    const passwordValue = document.getElementById('reg-password').value;
    
    if (!usernameValue || !passwordValue) {
      setResult(prev => ({ ...prev, register: "Username and password are required."}));
      return;
    }

    const response = await handleResponse('/api/health', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', username: usernameValue, password: passwordValue })
    }, 'register');

    if (response.success && response.payload === 'User registered successfully') {
      setActiveTestUsername(usernameValue);
      setResult(prev => ({ ...prev, register: "User registered successfully! Active test user set: " + usernameValue }));
    }
  };

  const performAction = async (actionName, endpointAction, bodyParams = null) => {
    if (!activeTestUsername) {
      alert('Please set an active test username first (register a new user or enter one in the top-right box).');
      setResult(prev => ({ ...prev, [actionName]: 'Active test username not set.' }));
      return;
    }
    const username = activeTestUsername;
    let url = `/api/health?action=${endpointAction}&username=${encodeURIComponent(username)}`;
    let options = {};

    if (bodyParams) {
      url = '/api/health';
      options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: endpointAction, username, ...bodyParams })
      };
    } else {
        options = { method: 'GET' };
    }
    await handleResponse(url, options, actionName);
  };

  const logHealth = async () => {
    const steps = document.getElementById('steps').value;
    const sleepHours = document.getElementById('sleepHours').value;
    const waterIntake = document.getElementById('waterIntake').value;
    const mood = document.getElementById('mood').value;
    if (!steps || !sleepHours || !waterIntake || !mood ) {
        alert("All health log fields are required for logging.");
        setResult(prev => ({ ...prev, logHealth: 'All health log fields are required.' }));
        return;
    }
    performAction('logHealth', 'logHealth', { steps: parseInt(steps), sleepHours: parseFloat(sleepHours), waterIntake: parseFloat(waterIntake), mood });
  };

  const getProgress = () => performAction('getProgress', 'getProgress');
  const moodSleepCorrelation = () => performAction('moodSleepCorrelation', 'moodSleepCorrelation');
  const weeklyTrendReport = () => performAction('weeklyTrendReport', 'weeklyTrendReport');
  const detectAnomalies = () => performAction('detectAnomalies', 'detectAnomalies');
  const personalizedSuggestions = () => performAction('personalizedSuggestions', 'personalizedSuggestions');

  return (
    <main className={`relative flex flex-col items-center min-h-screen p-4 bg-background text-foreground ${geistSans.variable} font-sans pt-24`}>
      
      {/* Active Test Username Section - Fixed Top-Right */}
      <div className="fixed top-4 right-4 z-20 p-4 w-72 shadow-xl rounded-lg bg-white dark:bg-gray-800 space-y-3">
        <h2 className="text-md font-semibold text-gray-700 dark:text-gray-200">Active Test User</h2>
        <input
          type="text"
          id="active-test-username-input"
          // placeholder="Enter username for tests"
          value={activeTestUsername}
          disabled
          onChange={(e) => setActiveTestUsername(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-50 text-sm"
        />
        {activeTestUsername && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            Testing as: <strong>{activeTestUsername}</strong>
          </p>
        )}
      </div>

      {/* Main content area */}
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 text-center">Health Tracker</h1>
        
        {/* <div className="p-6 shadow-lg rounded-lg bg-white dark:bg-gray-800 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">1. Register User (or Set Active User in Top-Right)</h2>
          <input type="text" id="reg-username" placeholder="Username to Register" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-50" />
          <input type="password" id="reg-password" placeholder="Password" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-50" />
          <button onClick={registerUser} className="w-full bg-gray-700 text-white p-3 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-600 dark:hover:bg-gray-500">Register & Set Active</button>
          <div className="mt-4 p-4 rounded-md bg-gray-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 overflow-x-auto min-h-[50px]">
            {formatData(result.register)}
          </div>
        </div> */}

        <div className="p-6 shadow-lg rounded-lg bg-white dark:bg-gray-800 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Log Daily Health (for Active User)</h2>
          <input type="number" id="steps" placeholder="Steps" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-50" />
          <input type="number" id="sleepHours" placeholder="Sleep Hours (e.g., 7.5)" step="0.1" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-50" />
          <input type="number" id="waterIntake" placeholder="Water Intake (Liters, e.g., 2.5)" step="0.1" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-50" />
          <input type="text" id="mood" placeholder="Mood (e.g., happy, sad, neutral)" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-50" />
          <button onClick={logHealth} className="w-full bg-gray-700 text-white p-3 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-600 dark:hover:bg-gray-500">Log Health</button>
          <div className="mt-4 p-4 rounded-md bg-gray-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 overflow-x-auto min-h-[50px]">
            {formatData(result.logHealth)}
          </div>
        </div>

        <div className="p-6 shadow-lg rounded-lg bg-white dark:bg-gray-800 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">View Progress (for Active User)</h2>
          <button onClick={getProgress} className="w-full bg-gray-700 text-white p-3 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-600 dark:hover:bg-gray-500">Get Progress</button>
          <div className="mt-4 p-4 rounded-md bg-gray-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 overflow-x-auto min-h-[50px]">
            {formatData(result.getProgress)}
          </div>
        </div>

        <div className="p-6 shadow-lg rounded-lg bg-white dark:bg-gray-800 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Mood & Sleep Correlation (for Active User)</h2>
          <button onClick={moodSleepCorrelation} className="w-full bg-gray-700 text-white p-3 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-600 dark:hover:bg-gray-500">Check Correlation</button>
          <div className="mt-4 p-4 rounded-md bg-gray-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 overflow-x-auto min-h-[50px]">
            {formatData(result.moodSleepCorrelation)}
          </div>
        </div>

        <div className="p-6 shadow-lg rounded-lg bg-white dark:bg-gray-800 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Weekly Trend Report (for Active User)</h2>
          <button onClick={weeklyTrendReport} className="w-full bg-gray-700 text-white p-3 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-600 dark:hover:bg-gray-500">Get Trend Report</button>
          <div className="mt-4 p-4 rounded-md bg-gray-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 overflow-x-auto min-h-[50px]">
            {formatData(result.weeklyTrendReport)}
          </div>
        </div>

        <div className="p-6 shadow-lg rounded-lg bg-white dark:bg-gray-800 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Anomaly Detection (for Active User)</h2>
          <button onClick={detectAnomalies} className="w-full bg-gray-700 text-white p-3 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-600 dark:hover:bg-gray-500">Detect Anomalies</button>
          <div className="mt-4 p-4 rounded-md bg-gray-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 overflow-x-auto min-h-[50px]">
            {formatData(result.detectAnomalies)}
          </div>
        </div>

        <div className="p-6 shadow-lg rounded-lg bg-white dark:bg-gray-800 space-y-4 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Personalized Suggestions (for Active User)</h2>
          <button onClick={personalizedSuggestions} className="w-full bg-gray-700 text-white p-3 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-600 dark:hover:bg-gray-500">Get Suggestions</button>
          <div className="mt-4 p-4 rounded-md bg-gray-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 overflow-x-auto min-h-[50px]">
            {formatData(result.personalizedSuggestions)}
          </div>
        </div>

      </div>
    </main>
  );
} 