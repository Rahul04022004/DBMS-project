import { MongoClient, ObjectId } from 'mongodb';

const uri = 'mongodb://localhost:27017';
const dbName = 'health_wellbeing_db';

export default async function handler(req, res) {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const users = db.collection('users');
  const healthLogs = db.collection('health_logs');

  async function registerUser(users, username, password) {
    const existing = await users.findOne({ username });
    if (existing) return 'User already exists';
    await users.insertOne({ username, password, createdAt: new Date() });
    return 'User registered successfully';
  }

  async function logDailyHealth(users, healthLogs, username, steps, sleepHours, waterIntake, mood) {
    const user = await users.findOne({ username });
    if (!user) return 'User not found';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await healthLogs.insertOne({
      userId: user._id,
      date: today,
      steps,
      sleepHours,
      waterIntake,
      mood,
    });
    return 'Health log added';
  }

  async function getProgress(users, healthLogs, username) {
    const user = await users.findOne({ username });
    if (!user) return 'User not found';
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);
    const logs = await healthLogs
      .find({ userId: user._id, date: { $gte: weekAgo } })
      .toArray();
    return logs;
  }

  async function moodSleepCorrelation(users, healthLogs, username) {
    const user = await users.findOne({ username });
    if (!user) return 'User not found';
    const logs = await healthLogs.find({ userId: user._id })
      .sort({ date: -1 }).limit(30).toArray();
    if (logs.length < 2) return 'Not enough data';

    const moodMap = { sad: 1, neutral: 2, happy: 3, stressed: 0, excited: 4 };
    const sleep = [];
    const mood = [];
    logs.forEach(log => {
      if (typeof log.sleepHours === 'number' && moodMap[log.mood] !== undefined) {
        sleep.push(log.sleepHours);
        mood.push(moodMap[log.mood]);
      }
    });

    function pearson(x, y) {
      const n = x.length;
      const avgX = x.reduce((a, b) => a + b, 0) / n;
      const avgY = y.reduce((a, b) => a + b, 0) / n;
      const num = x.map((xi, i) => (xi - avgX) * (y[i] - avgY)).reduce((a, b) => a + b, 0);
      const denX = Math.sqrt(x.map(xi => (xi - avgX) ** 2).reduce((a, b) => a + b, 0));
      const denY = Math.sqrt(y.map(yi => (yi - avgY) ** 2).reduce((a, b) => a + b, 0));
      return denX && denY ? num / (denX * denY) : 0;
    }

    const correlation = pearson(sleep, mood);
    if (correlation > 0.5) return 'Your mood improves with more sleep!';
    if (correlation < -0.5) return 'Your mood worsens with more sleep.';
    return 'No strong correlation between mood and sleep detected.';
  }

  async function weeklyTrendReport(users, healthLogs, username) {
    const user = await users.findOne({ username });
    if (!user) return 'User not found';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    const logs = await healthLogs.find({ userId: user._id, date: { $gte: weekAgo } }).toArray();
    if (logs.length === 0) return 'No logs for the past week.';

    const avg = logs.reduce((acc, log) => ({
      steps: acc.steps + log.steps,
      sleepHours: acc.sleepHours + log.sleepHours,
      waterIntake: acc.waterIntake + log.waterIntake,
    }), { steps: 0, sleepHours: 0, waterIntake: 0 });

    const averages = {
      steps: Math.round(avg.steps / logs.length),
      sleepHours: +(avg.sleepHours / logs.length).toFixed(2),
      waterIntake: +(avg.waterIntake / logs.length).toFixed(2),
    };

    const sortedLogs = logs.sort((a, b) => a.date - b.date);
    const firstHalf = sortedLogs.slice(0, 3);
    const lastHalf = sortedLogs.slice(-3);

    function avgField(arr, field) {
      if (arr.length === 0) return 0;
      return arr.reduce((sum, l) => sum + l[field], 0) / arr.length;
    }

    const trends = {
      steps: avgField(lastHalf, 'steps') - avgField(firstHalf, 'steps'),
      sleepHours: avgField(lastHalf, 'sleepHours') - avgField(firstHalf, 'sleepHours'),
      waterIntake: avgField(lastHalf, 'waterIntake') - avgField(firstHalf, 'waterIntake'),
    };

    return {
      averages,
      trends: {
        steps: trends.steps > 0 ? 'increasing' : (trends.steps < 0 ? 'decreasing' : 'stable'),
        sleepHours: trends.sleepHours > 0 ? 'increasing' : (trends.sleepHours < 0 ? 'decreasing' : 'stable'),
        waterIntake: trends.waterIntake > 0 ? 'increasing' : (trends.waterIntake < 0 ? 'decreasing' : 'stable'),
      }
    };
  }

  async function detectAnomalies(users, healthLogs, username) {
    const user = await users.findOne({ username });
    if (!user) return 'User not found';
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const logs = await healthLogs.find({ userId: user._id, date: { $gte: weekAgo } }).toArray();
    if (logs.length < 2) return 'Not enough data for anomaly detection.';

    const avg = logs.reduce((acc, log) => ({
      steps: acc.steps + log.steps,
      sleepHours: acc.sleepHours + log.sleepHours,
    }), { steps: 0, sleepHours: 0 });

    const averages = {
      steps: avg.steps / logs.length,
      sleepHours: avg.sleepHours / logs.length,
    };

    const anomalies = logs.filter(log =>
      log.steps < averages.steps * 0.5 || log.sleepHours < averages.sleepHours * 0.5
    ).map(log => ({
      date: log.date,
      steps: log.steps,
      sleepHours: log.sleepHours
    }));

    return anomalies.length ? anomalies : 'No anomalies detected in the last week.';
  }

  async function personalizedSuggestions(users, healthLogs, username) {
    const user = await users.findOne({ username });
    if (!user) return 'User not found';
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const logs = await healthLogs.find({ userId: user._id, date: { $gte: weekAgo } }).toArray();
    if (logs.length === 0) return 'No logs for suggestions.';

    const avgSteps = logs.reduce((sum, l) => sum + l.steps, 0) / logs.length;
    const avgSleep = logs.reduce((sum, l) => sum + l.sleepHours, 0) / logs.length;
    const avgWater = logs.reduce((sum, l) => sum + l.waterIntake, 0) / logs.length;

    const suggestions = [];
    if (avgSteps < 5000) suggestions.push('Try to walk at least 5,000 steps daily for better health.');
    else suggestions.push('Great job on your step count! Keep it up.');

    if (avgSleep < 7) suggestions.push('Aim for at least 7 hours of sleep each night.');
    else suggestions.push('Your sleep duration is on track.');

    if (avgWater < 2) suggestions.push('Increase your water intake to at least 2 liters per day.');
    else suggestions.push('Hydration level is good.');

    return suggestions;
  }

  if (req.method === 'POST') {
    const { action, username, password, steps, sleepHours, waterIntake, mood } = req.body;
    let result;
    switch (action) {
      case 'register':
        result = await registerUser(users, username, password);
        break;
      case 'logHealth':
        result = await logDailyHealth(users, healthLogs, username, steps, sleepHours, waterIntake, mood);
        break;
      default:
        result = 'Invalid action';
    }
    res.status(200).json({ message: result });
  } else if (req.method === 'GET') {
    const { action, username } = req.query;
    let result;
    switch (action) {
      case 'getProgress':
        result = await getProgress(users, healthLogs, username);
        break;
      case 'moodSleepCorrelation':
        result = await moodSleepCorrelation(users, healthLogs, username);
        break;
      case 'weeklyTrendReport':
        result = await weeklyTrendReport(users, healthLogs, username);
        break;
      case 'detectAnomalies':
        result = await detectAnomalies(users, healthLogs, username);
        break;
      case 'personalizedSuggestions':
        result = await personalizedSuggestions(users, healthLogs, username);
        break;
      default:
        result = 'Invalid action';
    }
    res.status(200).json({ data: result });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  await client.close();
} 