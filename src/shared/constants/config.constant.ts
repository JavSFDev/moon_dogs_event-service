import { NodeEnv } from '../../config/config.service';

export const RPC_URL = {
  [NodeEnv.DEV]: 'https://rpc.test.btcs.network',
  [NodeEnv.PROD]: {
    1: 'https://core.positron.network',
    2: 'https://core.public.infstones.com',
    3: 'https://rpc1.shadowswap.xyz',
    4: 'https://core-blockchain.rpc.thirdweb.com',
  },
};

export const SCAN_URL = {
  [NodeEnv.DEV]: 'https://scan.test.btcs.network',
  [NodeEnv.PROD]: 'https://scan.coredao.org/',
};

export const START_BLOCK_NUMBER = {
  [NodeEnv.DEV]: 0,
  [NodeEnv.PROD]: 0,
};

export const MARKETPLACE_START_BLOCK_NUMBER = {
  [NodeEnv.DEV]: 2426795,
  [NodeEnv.PROD]: 2426795,
};

export const MULTICALL_ADDRESS = {
  [NodeEnv.DEV]: '0x4d1d23CF011914EcD6af659173eB02cc99e119BF',
  [NodeEnv.PROD]: '0x1FE70b59a64551805aE1b8149e19dE40493A6d4F',
};

export const MARKET_CONTRACT_ADDRESS = {
  [NodeEnv.DEV]: '0x182eB2c9206df62C9cD89a84A1CC0b37655E9387',
  [NodeEnv.PROD]: '0x182eB2c9206df62C9cD89a84A1CC0b37655E9387',
};
