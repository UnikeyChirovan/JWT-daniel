const Redis = require('ioredis');

// Đọc các thông tin kết nối từ biến môi trường
const redisHost = process.env.HOST_REDIS;
const redisPort = process.env.PORT_REDIS;
const redisPassword = process.env.PWD_REDIS;

// Tạo một phiên bản Redis client để kết nối đến Redis cloud
const redisClient = new Redis({
  host: redisHost,
  port: redisPort,
  password: redisPassword, // (Nếu Redis cloud yêu cầu xác thực)
});

// Xử lý sự kiện khi kết nối tới Redis thành công
redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

// Xử lý sự kiện khi gặp lỗi trong quá trình kết nối tới Redis
redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

module.exports = redisClient;
