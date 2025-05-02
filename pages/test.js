import React, { useState } from 'react';

export default function TestPage() {
  const [result, setResult] = useState({});

  const handleResponse = async (url, options, key) => {
    const response = await fetch(url, options);
    const data = await response.json();
    setResult(prev => ({ ...prev, [key]: data.data }));
  };

  const formatData = (data) => {
    if (Array.isArray(data)) {
      return (
        <ul className="list-disc pl-5">
          {data.map((item, index) => (
            <li key={index} className="mb-1">
              {typeof item === 'object' ? JSON.stringify(item, null, 2) : item}
            </li>
          ))}
        </ul>
      );
    } else if (typeof data === 'object') {
      return (
        <div className="space-y-1">
          {Object.entries(data).map(([key, value], index) => {
            if (key === 'date') {
              value = new Date(value).toLocaleDateString();
            }
            return (
              <div key={index} className="text-sm">
                <strong>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</strong> {value}
              </div>
            );
          })}
        </div>
      );
    }
    return data;
  };

  const registerUser = () => {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    handleResponse('/api/health', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', username, password })
    }, 'register').then(() => {
      const message = typeof result.register === 'string' && result.register.includes('exists')
        ? 'User already exists.'
        : 'User registered successfully!';
      setResult(prev => ({ ...prev, register: message }));
    }).catch(() => {
      setResult(prev => ({ ...prev, register: 'Failed to register user.' }));
    });
  };

  const logHealth = () => {
    const username = document.getElementById('log-username').value;
    const steps = document.getElementById('steps').value;
    const sleepHours = document.getElementById('sleepHours').value;
    const waterIntake = document.getElementById('waterIntake').value;
    const mood = document.getElementById('mood').value;
    handleResponse('/api/health', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logHealth', username, steps, sleepHours, waterIntake, mood })
    }, 'logHealth').then(() => {
      setResult(prev => ({ ...prev, logHealth: 'Health data logged successfully!' }));
    }).catch(() => {
      setResult(prev => ({ ...prev, logHealth: 'Failed to log health data.' }));
    });
  };

  const getProgress = () => {
    const username = document.getElementById('prog-username').value;
    handleResponse(`/api/health?action=getProgress&username=${username}`, {}, 'getProgress');
  };

  const moodSleepCorrelation = () => {
    const username = document.getElementById('correlation-username').value;
    handleResponse(`/api/health?action=moodSleepCorrelation&username=${username}`, {}, 'moodSleepCorrelation');
  };

  const weeklyTrendReport = () => {
    const username = document.getElementById('trend-username').value;
    handleResponse(`/api/health?action=weeklyTrendReport&username=${username}`, {}, 'weeklyTrendReport');
  };

  const detectAnomalies = () => {
    const username = document.getElementById('anomaly-username').value;
    handleResponse(`/api/health?action=detectAnomalies&username=${username}`, {}, 'detectAnomalies');
  };

  const personalizedSuggestions = () => {
    const username = document.getElementById('suggestions-username').value;
    handleResponse(`/api/health?action=personalizedSuggestions&username=${username}`, {}, 'personalizedSuggestions');
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Health API Test</h1>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Register User</h2>
        <input type="text" id="reg-username" placeholder="Username" className="w-full p-3 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
        <input type="password" id="reg-password" placeholder="Password" className="w-full p-3 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
        <button onClick={registerUser} className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500">Register</button>
        <div className="mt-3 text-sm text-white bg-black p-3 rounded">{formatData(result.register)}</div>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Log Daily Health</h2>
        <input type="text" id="log-username" placeholder="Username" className="w-full p-3 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
        <input type="number" id="steps" placeholder="Steps" className="w-full p-3 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
        <input type="number" id="sleepHours" placeholder="Sleep Hours" className="w-full p-3 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
        <input type="number" id="waterIntake" placeholder="Water Intake (L)" className="w-full p-3 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
        <input type="text" id="mood" placeholder="Mood" className="w-full p-3 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
        <button onClick={logHealth} className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500">Log Health</button>
        <div className="mt-3 text-sm text-white bg-black p-3 rounded">{formatData(result.logHealth)}</div>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">View Progress</h2>
        <input type="text" id="prog-username" placeholder="Username" className="w-full p-3 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
        <button onClick={getProgress} className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500">Get Progress</button>
        <div className="mt-3 text-sm text-white bg-black p-3 rounded">{formatData(result.getProgress)}</div>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Mood & Sleep Correlation</h2>
        <input type="text" id="correlation-username" placeholder="Username" className="w-full p-3 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
        <button onClick={moodSleepCorrelation} className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500">Check Correlation</button>
        <div className="mt-3 text-sm text-white bg-black p-3 rounded">{formatData(result.moodSleepCorrelation)}</div>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Weekly Trend Report</h2>
        <input type="text" id="trend-username" placeholder="Username" className="w-full p-3 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
        <button onClick={weeklyTrendReport} className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500">Get Trend Report</button>
        <div className="mt-3 text-sm text-white bg-black p-3 rounded">{formatData(result.weeklyTrendReport)}</div>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Anomaly Detection</h2>
        <input type="text" id="anomaly-username" placeholder="Username" className="w-full p-3 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
        <button onClick={detectAnomalies} className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500">Detect Anomalies</button>
        <div className="mt-3 text-sm text-white bg-black p-3 rounded">{formatData(result.detectAnomalies)}</div>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Personalized Suggestions</h2>
        <input type="text" id="suggestions-username" placeholder="Username" className="w-full p-3 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
        <button onClick={personalizedSuggestions} className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500">Get Suggestions</button>
        <div className="mt-3 text-sm text-white bg-black p-3 rounded">{formatData(result.personalizedSuggestions)}</div>
      </div>
    </div>
  );
} 