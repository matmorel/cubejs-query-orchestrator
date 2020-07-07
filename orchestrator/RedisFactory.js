const Redis = require('ioredis');

module.exports = function createRedisClient(url) {
  // map exec responses to match node-redis: https://github.com/luin/ioredis/wiki/Migrating-from-node_redis
  Redis.Pipeline.prototype.execAsync = function () {
      return new Promise((resolve, reject) => {
          // rely on scope
          this.exec(function (err, res) {
              console.log(err, res)
              if (err) return reject(err);
              return resolve(res.map((nestArr) => nestArr[1]));
          })
      })
  };
  const [host, port] = url.replace('redis://', '').split(':');
  let options = {
      sentinels: [{ host, port }],
      name: "mymaster"
  };

  if (process.env.REDIS_TLS === 'true') {
      options.tls = {};
  }

  if (process.env.REDIS_PASSWORD) {
      options.password = process.env.REDIS_PASSWORD;
  }

  const client = new Redis(options);

  [
    'brpop',
    'del',
    'get',
    'hget',
    'rpop',
    'set',
    'zadd',
    'zrange',
    'zrangebyscore',
    'keys',
    'watch',
    'incr',
    'decr',
    'lpush'
  ].forEach(
      k => {
          client[`${k}Async`] = client[k];
      }
  );

  return client;
};
