import EthereumProvider from '@walletconnect/ethereum-provider';

let walletConnectProvider = null;

export function getInjectedEthereum() {
  if (typeof window === 'undefined') return null;

  const eth = window.ethereum;
  if (eth && Array.isArray(eth.providers)) {
    const metamask = eth.providers.find((provider) => provider.isMetaMask);
    const rabby = eth.providers.find((provider) => provider.isRabby);
    return metamask || rabby || eth.providers[0] || eth;
  }

  return eth || walletConnectProvider;
}

export function isValidEvmAddress(address = '') {
  return /^0x[a-fA-F0-9]{40}$/.test(String(address).trim());
}

function assertAddress(address, label = 'address') {
  if (!isValidEvmAddress(address)) {
    throw new Error(`Invalid ${label}: ${address || '(empty)'}`);
  }
}

function assertChainReady(chain) {
  if (!chain?.chainIdHex || !chain?.chainIdDecimal) {
    throw new Error('Payment network is missing chain configuration.');
  }
}

function walletParams(chain) {
  return {
    chainId: chain.chainIdHex,
    chainName: chain.label,
    rpcUrls: chain.rpcUrls || [],
    nativeCurrency: chain.nativeCurrency,
    blockExplorerUrls: chain.explorerUrl ? [chain.explorerUrl] : [],
  };
}

function walletConnectProjectId() {
  return import.meta.env?.VITE_WALLETCONNECT_PROJECT_ID || '';
}

async function getWalletConnectProvider(chain) {
  const projectId = walletConnectProjectId();

  if (!projectId) {
    throw new Error('WalletConnect projectId is missing. Set VITE_WALLETCONNECT_PROJECT_ID in .env.');
  }

  if (!walletConnectProvider) {
    walletConnectProvider = await EthereumProvider.init({
      projectId,
      chains: [chain.chainIdDecimal],
      optionalChains: [chain.chainIdDecimal],
      rpcMap: {
        [chain.chainIdDecimal]: chain.rpcUrls?.[0],
      },
      showQrModal: true,
      metadata: {
        name: 'Paynet APoint Loyalty',
        description: 'Paynet USDC checkout',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://paynet.local',
        icons: typeof window !== 'undefined' ? [`${window.location.origin}/png/logo/paynet-logo.png`] : [],
      },
    });
  }

  return walletConnectProvider;
}

export async function ensureEvmChain(chain, ethereum = getInjectedEthereum()) {
  assertChainReady(chain);

  if (!ethereum) {
    throw new Error('No EVM wallet found. Please install MetaMask, Rabby, Coinbase Wallet, or another EVM wallet.');
  }

  const currentChain = await ethereum.request({ method: 'eth_chainId' });

  if (String(currentChain).toLowerCase() === chain.chainIdHex.toLowerCase()) {
    return true;
  }

  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chain.chainIdHex }],
    });

    return true;
  } catch (switchError) {
    if (switchError?.code !== 4902) {
      throw switchError;
    }

    await ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [walletParams(chain)],
    });

    return true;
  }
}

export async function connectEvmWallet(chain) {
  let ethereum = getInjectedEthereum();

  if (!ethereum) {
    ethereum = await getWalletConnectProvider(chain);
  }

  const accounts = ethereum === walletConnectProvider
    ? await ethereum.enable()
    : await ethereum.request({ method: 'eth_requestAccounts' });
  const address = accounts?.[0];

  assertAddress(address, 'connected wallet');

  await ensureEvmChain(chain, ethereum);

  return {
    address,
    chainId: chain.chainIdDecimal,
    network: chain.label,
    provider: ethereum,
  };
}
