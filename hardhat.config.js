require('@nomicfoundation/hardhat-ethers');
require('dotenv').config();

const FUJI_RPC_URL = process.env.FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || '';

module.exports = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    fuji: {
      url: FUJI_RPC_URL,
      chainId: 43113,
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
    },
  },
};
