import { MongoClient } from 'mongodb';

const uri = 'mongodb://localhost:27017';
const dbName = 'health_wellbeing_db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection('users');
    const healthLogs = db.collection('health_logs');

    const userStats = await users.aggregate([
      {
        $lookup: {
          from: 'health_logs',
          localField: '_id',
          foreignField: 'userId',
          as: 'logs'
        }
      },
      {
        $project: {
          username: 1,
          steps: { $sum: { $map: { input: '$logs', as: 'log', in: { $toInt: '$$log.steps' } } } },
          sleepHours: { $avg: { $map: { input: '$logs', as: 'log', in: { $toDouble: '$$log.sleepHours' } } } },
          waterIntake: { $avg: { $map: { input: '$logs', as: 'log', in: { $toDouble: '$$log.waterIntake' } } } }
        }
      }
    ]).toArray();

    res.status(200).json(userStats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
} 