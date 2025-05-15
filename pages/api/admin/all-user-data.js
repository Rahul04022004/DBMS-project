import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB_NAME || 'health_wellbeing_db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    const healthLogsCollection = db.collection('health_logs');

    // Fetch all users. Select only necessary fields if needed, but for now, all.
    // Omitting password for security, even for an admin view.
    const users = await usersCollection.find({}, { projection: { password: 0 } }).toArray();

    // For each user, fetch their health logs
    const allUserData = [];
    for (const user of users) {
      const userHealthLogs = await healthLogsCollection
        .find({ userId: user._id })
        .sort({ date: -1 }) // Sort logs by date, newest first
        .toArray();
      
      allUserData.push({
        ...user, // Spread all user fields (except password)
        healthLogs: userHealthLogs,
      });
    }

    res.status(200).json({ data: allUserData });

  } catch (error) {
    console.error('Error fetching all user data:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  } finally {
    await client.close();
  }
}
