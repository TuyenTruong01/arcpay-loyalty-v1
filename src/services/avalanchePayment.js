import { connectEvmWallet, ensureEvmChain, getInjectedEthereum, isValidEvmAddress } from './evmWallet.js';
import { DISPLAY_UNITS_PER_USDC } from '../utils/format.js';

const ERC20_TRANSFER_SELECTOR = '0xa9059cbb';

export const AVALANCHE_FUJI_CHAIN = {
  code: 'avalanche-fuji',
  label: 'Avalanche Fuji',
  family: 'evm',
  chainIdDecimal: 43113,
  chainIdHex: '0xa869',
  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
  explorerUrl: 'https://testnet.snowtrace.io',
  nativeCurrency: {
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18,
  },
};

export const FUJI_USDC = {
  symbol: 'USDC',
  decimals: 6,
  address: import.meta.env?.VITE_AVAX_FUJI_USDC_ADDRESS || '0x5425890298aed601595a70AB815c96711a31Bc65',
};

export function fujiTxUrl(txHash = '') {
  return txHash ? `${AVALANCHE_FUJI_CHAIN.explorerUrl}/tx/${txHash}` : '';
}

function assertAddress(address, label = 'address') {
  if (!isValidEvmAddress(address)) {
    throw new Error(`Invalid ${label}: ${address || '(empty)'}`);
  }
}

function strip0x(value = '') {
  return String(value).replace(/^0x/i, '');
}

function pad32(hexValue = '') {
  return strip0x(hexValue).padStart(64, '0');
}

function encodeAddress(address) {
  assertAddress(address, 'address');
  return pad32(address.toLowerCase());
}

function encodeUint256(value) {
  const big = BigInt(value);
  if (big < 0n) throw new Error('Amount must be positive.');
  return big.toString(16).padStart(64, '0');
}

export function rawAmountToUsdcUnits(rawAmount = 0) {
  const raw = BigInt(Math.max(0, Math.round(Number(rawAmount || 0))));
  const tokenBase = 10n ** BigInt(FUJI_USDC.decimals);
  return raw * (tokenBase / BigInt(DISPLAY_UNITS_PER_USDC));
}

export function encodeFujiUsdcTransfer(to, rawAmount) {
  const amount = rawAmountToUsdcUnits(rawAmount);

  if (amount <= 0n) {
    throw new Error('Payment amount must be greater than 0 USDC.');
  }

  return `${ERC20_TRANSFER_SELECTOR}${encodeAddress(to)}${encodeUint256(amount)}`;
}

export async function connectAvalancheFujiWallet() {
  return connectEvmWallet(AVALANCHE_FUJI_CHAIN);
}

export async function sendAvalancheFujiUsdcPayment({ from, to, rawAmount }) {
  const ethereum = getInjectedEthereum();

  if (!ethereum) {
    throw new Error('No EVM wallet found.');
  }

  assertAddress(from, 'customer wallet');
  assertAddress(to, 'store receiver wallet');

  await ensureEvmChain(AVALANCHE_FUJI_CHAIN);

  return ethereum.request({
    method: 'eth_sendTransaction',
    params: [
      {
        from,
        to: FUJI_USDC.address,
        value: '0x0',
        data: encodeFujiUsdcTransfer(to, rawAmount),
      },
    ],
  });
}

export async function waitForAvalancheFujiReceipt(txHash, { timeoutMs = 90000, intervalMs = 1500 } = {}) {
  const ethereum = getInjectedEthereum();

  if (!ethereum) {
    throw new Error('No EVM wallet found.');
  }

  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const receipt = await ethereum.request({
      method: 'eth_getTransactionReceipt',
      params: [txHash],
    });

    if (receipt) return receipt;

    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Transaction was submitted but no receipt was found yet. Check Fuji explorer: ${fujiTxUrl(txHash)}`);
}
