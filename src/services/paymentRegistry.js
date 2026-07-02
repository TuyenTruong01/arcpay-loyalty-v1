import { ethers } from 'ethers';

export const ARCPAY_PAYMENT_REGISTRY_ADDRESS =
  '0x7B9941Da31b2194Efc2881af3B35987EeF137AA6';

export const ARCPAY_PAYMENT_REGISTRY_ABI = [
  {
    inputs: [
      { internalType: 'bytes32', name: 'invoiceHash', type: 'bytes32' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'address', name: 'payer', type: 'address' },
      { internalType: 'address', name: 'merchant', type: 'address' },
      { internalType: 'bytes32', name: 'paymentTxHash', type: 'bytes32' },
      { internalType: 'bytes32', name: 'checkoutTokenHash', type: 'bytes32' },
      { internalType: 'string', name: 'metadataURI', type: 'string' },
    ],
    name: 'recordPaymentProof',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'invoiceHash', type: 'bytes32' }],
    name: 'hasPaymentProof',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'invoiceHash', type: 'bytes32' }],
    name: 'getPaymentProof',
    outputs: [
      { internalType: 'bytes32', name: '', type: 'bytes32' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'bytes32', name: '', type: 'bytes32' },
      { internalType: 'bytes32', name: '', type: 'bytes32' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'string', name: '', type: 'string' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

function isBytes32(value = '') {
  return /^0x[a-fA-F0-9]{64}$/.test(String(value || '').trim());
}

function toBytes32Hash(value = '') {
  const text = String(value || '').trim();

  if (isBytes32(text)) {
    return text;
  }

  return ethers.id(text || `arcpay-${Date.now()}`);
}

export function arcRegistryTxUrl(txHash = '') {
  return txHash ? `https://testnet.arcscan.app/tx/${txHash}` : '';
}

export function arcRegistryContractUrl() {
  return `https://testnet.arcscan.app/address/${ARCPAY_PAYMENT_REGISTRY_ADDRESS}`;
}

export async function recordPaymentProofOnArc({
  invoiceCode,
  checkoutToken,
  payer,
  merchant,
  amount,
  paymentTxHash,
  metadata = {},
}) {
  if (!window.ethereum) {
    throw new Error('No EVM wallet found. Please open this page with an EVM wallet.');
  }

  if (!payer || !merchant) {
    throw new Error('Missing payer or merchant wallet for payment proof.');
  }

  if (!Number(amount || 0)) {
    throw new Error('Payment proof amount must be greater than 0.');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const signerAddress = await signer.getAddress();
  const signerLower = signerAddress.toLowerCase();
  const payerLower = String(payer).toLowerCase();
  const merchantLower = String(merchant).toLowerCase();

  if (signerLower !== payerLower && signerLower !== merchantLower) {
    throw new Error('Payment proof must be recorded by the payer wallet or merchant wallet.');
  }

  const contract = new ethers.Contract(
    ARCPAY_PAYMENT_REGISTRY_ADDRESS,
    ARCPAY_PAYMENT_REGISTRY_ABI,
    signer
  );

  const invoiceHash = toBytes32Hash(invoiceCode);
  const checkoutTokenHash = toBytes32Hash(checkoutToken);
  const safePaymentTxHash = toBytes32Hash(paymentTxHash);

  const alreadyRecorded = await contract.hasPaymentProof(invoiceHash);

  if (alreadyRecorded) {
    return {
      alreadyRecorded: true,
      proofTxHash: '',
      invoiceHash,
      checkoutTokenHash,
      contractAddress: ARCPAY_PAYMENT_REGISTRY_ADDRESS,
    };
  }

  const metadataURI = JSON.stringify({
    app: 'ArcPay Loyalty POS',
    network: 'arc-testnet',
    invoiceCode,
    checkoutToken,
    payer,
    merchant,
    paymentTxHash,
    amount,
    ...metadata,
  });

  const tx = await contract.recordPaymentProof(
    invoiceHash,
    BigInt(Math.floor(Number(amount || 0))),
    payer,
    merchant,
    safePaymentTxHash,
    checkoutTokenHash,
    metadataURI
  );

  const receipt = await tx.wait();

  return {
    alreadyRecorded: false,
    proofTxHash: tx.hash,
    receipt,
    invoiceHash,
    checkoutTokenHash,
    contractAddress: ARCPAY_PAYMENT_REGISTRY_ADDRESS,
  };
}