import mongoose from 'mongoose';
import winston from 'winston';
import { seedDatabase } from './seed.js';
import { syncEnvironmentFromSecrets } from '../controllers/integrationsController.js';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/one_janitorial');
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    // Run database seeder
    await seedDatabase();
    // Sync vault credentials from DB to process.env
    await syncEnvironmentFromSecrets();
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

