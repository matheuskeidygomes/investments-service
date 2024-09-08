const environment = () => ({
  cacheMaxSize: parseInt(process.env.CACHE_MAX_SIZE) || 1000,
  cacheTimeout: parseInt(process.env.CACHE_TIMEOUT) || 10,
  requestPerMinute: parseInt(process.env.REQUEST_PER_MINUTE) || 10,
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT) || 30000,
  redisPort: parseInt(process.env.REDIS_PORT) || 6379,
  redisHost: process.env.REDIS_HOST || 'localhost',
  jwtSecret: process.env.JWT_SECRET || 'secret',
  jwtExpiration: process.env.JWT_EXPIRATION || '1d',
  databaseUrl: process.env.DATABASE_URL,
});

export default environment;
