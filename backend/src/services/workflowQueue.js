import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
let redisConnection = null;
let useRedis = false;
let workflowQueue = null;
let workflowWorker = null;

// Initialize queue with optional Redis
export const initWorkflowQueue = async () => {
  try {
    logger.info(`Attempting to connect to Redis at ${REDIS_URL} for BullMQ...`);
    redisConnection = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,
      connectTimeout: 2000,
      lazyConnect: true
    });
    
    await redisConnection.connect();
    useRedis = true;
    logger.info('Successfully connected to Redis. Initializing BullMQ...');
    
    workflowQueue = new Queue('WorkflowQueue', { connection: redisConnection });
    
    workflowWorker = new Worker('WorkflowQueue', async (job) => {
      logger.info(`Processing BullMQ job: ${job.id} for execution: ${job.data.executionId}`);
      const { executeWorkflowEngine } = await import('./workflowEngine.js');
      await executeWorkflowEngine(job.data.executionId);
    }, { connection: redisConnection });
    
    workflowWorker.on('failed', (job, err) => {
      logger.error(`BullMQ Job ${job?.id} failed: ${err.message}`);
    });
    
  } catch (error) {
    useRedis = false;
    logger.warn(`Redis is offline or failed to connect (${error.message}). Falling back to IN-MEMORY execution mode.`);
    if (redisConnection) {
      try {
        redisConnection.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
    }
  }
};

// Queue Job Adder
export const addWorkflowJob = async (executionId) => {
  if (useRedis && workflowQueue) {
    logger.info(`Enqueuing execution ${executionId} on BullMQ queue.`);
    await workflowQueue.add('execute-workflow', { executionId });
  } else {
    logger.info(`Enqueuing execution ${executionId} on IN-MEMORY queue.`);
    // Asynchronous run in-memory
    setTimeout(async () => {
      try {
        const { executeWorkflowEngine } = await import('./workflowEngine.js');
        await executeWorkflowEngine(executionId);
      } catch (err) {
        logger.error(`In-memory execution error for ${executionId}: ${err.message}`);
      }
    }, 50);
  }
};
