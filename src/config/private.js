const winston = require('winston');
const knex = require('knex');

module.exports = {
  port: 8000,
  ethereumProvider: 'http://localhost:8545',
  wtIndexAddress: '0x840ca4c06c87931218907bcf55e39a7964997f8a',
  ethNetwork: 'local',
  swarm: {
    provider: 'https://swarm-gateways.net/',
    timeoutRead: 500,
    timeoutWrite: 1000,
  },
  baseUrl: 'http://localhost:8000',
  db: knex({
    client: 'sqlite3',
    connection: {
      filename: './.dev.sqlite',
    },
    useNullAsDefault: true,
  }),
  allowedUploaders: ['s3', 'swarm', 'inMemory'],
  networkSetup: async (currentConfig) => {
    //const { deployIndex } = require('../utils/local-network');
    //currentConfig.wtIndexAddress = (await deployIndex()).address;
    //const wt = require('../services/wt').get();
    //wt.wtIndexAddress = currentConfig.wtIndexAddress;
    //currentConfig.logger.info(`Winding Tree index deployed to ${currentConfig.wtIndexAddress}`);
  },
  logger: winston.createLogger({
    level: 'debug',
    transports: [
      new winston.transports.Console({
        format: winston.format.simple(),
        stderrLevels: ['error'],
      }),
    ],
  }),
};
