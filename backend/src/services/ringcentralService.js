import logger from '../config/logger.js';

const isConfigured = () => {
  return !!(process.env.RINGCENTRAL_CLIENT_ID && process.env.RINGCENTRAL_JWT_TOKEN);
};

export const fetchRingCentralCallLogs = async (userId) => {
  if (isConfigured()) {
    logger.info(`Fetching REAL RingCentral call logs for user: ${userId}`);
    return [];
  } else {
    logger.info(`[MOCK RINGCENTRAL] Generating mock call logs for user: ${userId}`);
    return [
      { id: 'rc-1', direction: 'Inbound', from: '+15550199', to: '+15550100', durationSeconds: 120, status: 'Completed', timestamp: new Date(Date.now() - 30 * 60 * 1000) },
      { id: 'rc-2', direction: 'Outbound', from: '+15550100', to: '+15550211', durationSeconds: 45, status: 'Completed', timestamp: new Date(Date.now() - 60 * 60 * 1000) },
      { id: 'rc-3', direction: 'Inbound', from: '+15550144', to: '+15550100', durationSeconds: 0, status: 'Missed', timestamp: new Date(Date.now() - 3 * 3600 * 1000) },
      { id: 'rc-4', direction: 'Outbound', from: '+15550100', to: '+15550299', durationSeconds: 210, status: 'Completed', timestamp: new Date(Date.now() - 5 * 3600 * 1000) }
    ];
  }
};

export const getDailyPerformanceReport = async (userId) => {
  const logs = await fetchRingCentralCallLogs(userId);
  const totalCalls = logs.length;
  const completedCalls = logs.filter(l => l.status === 'Completed');
  const missedCalls = logs.filter(l => l.status === 'Missed').length;
  const totalTalkTime = completedCalls.reduce((acc, c) => acc + c.durationSeconds, 0);

  return {
    totalCalls,
    completedCallsCount: completedCalls.length,
    missedCalls,
    totalTalkTimeSeconds: totalTalkTime,
    averageTalkTimeSeconds: completedCalls.length > 0 ? Math.round(totalTalkTime / completedCalls.length) : 0
  };
};
