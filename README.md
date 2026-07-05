# Paynet APoint

Paynet APoint is a multi-store USDC point-of-sale and loyalty platform for grocery stores, coffee shops, restaurants, and other small retail businesses.

The app lets each participating store create invoices, accept USDC payments, and issue shared APoint loyalty rewards. Supabase stores the operational data, while Avalanche records payment proof events for important checkout activity.

## Problem / Solution

Small shops often use separate tools for checkout, inventory, staff access, and customer rewards. Loyalty points are usually locked to one store and are difficult to verify.

Paynet APoint solves this by providing:

- A shared loyalty network across multiple stores.
- Wallet-based role access for system admins, store owners, and staff.
- USDC checkout on Avalanche Fuji for demo payments.
- Supabase-backed store operations.
- On-chain payment proof for paid invoices and earned points.

## Key Features

- Multi-store admin console.
- Store owner and staff dashboards.
- Wallet whitelist role access from `src/config/roleAccess.json`.
- Product, warehouse, inventory, customer, order, and points views.
- QR checkout page for customers.
- USDC payment flow on Avalanche Fuji.
- APoint earning calculation.
- Payment proof recorded on-chain through `ApointPaymentProof`.
- Supabase remains the source of truth for private operational data.

## Current Demo Status

- Multi-store frontend is connected to Supabase demo data.
- Wallet-based role access is driven by `src/config/roleAccess.json`.
- Avalanche Fuji payment proof contract is deployed.
- USDC payment and proof recording are implemented for the checkout flow.
- APoint earning is tracked through the Supabase loyalty ledger in the current demo.
- WalletConnect support in progress for mobile Chrome/Safari checkout.
- Production redemption rules, mainnet configuration, and final security review are still pending.

## Demo Flow

1. A store staff wallet connects to Paynet APoint.
2. Staff creates an invoice in POS.
3. Paynet APoint generates a checkout QR/link.
4. Customer scans the QR with a phone.
5. Customer reviews invoice details and connects a wallet.
6. Customer pays USDC on Avalanche Fuji.
7. After the USDC transaction succeeds, Paynet APoint records payment proof on-chain.
8. Supabase marks the invoice as paid and stores tx/proof metadata.
9. In the current demo, APoint reward activity is reflected through the Supabase loyalty ledger for the customer wallet.

## Tech Stack

- React
- Vite
- Supabase
- EVM wallet provider
- WalletConnect provider dependency
- Hardhat
- Solidity
- Avalanche Fuji Testnet
- USDC test token

## Avalanche Fuji Integration

Paynet APoint currently targets Avalanche Fuji Testnet for the demo blockchain payment layer.

- Chain: Avalanche Fuji
- Chain ID: `43113`
- RPC: `https://api.avax-test.network/ext/bc/C/rpc`
- Fuji USDC test token: `0x5425890298aed601595a70AB815c96711a31Bc65`
- USDC token env: configured by `VITE_AVAX_FUJI_USDC_ADDRESS`
- Payment proof contract: `ApointPaymentProof`

Contract address:

```text
0xa32AB0188823d25972F27f7c4D9254ae626a0AB7
```

Example proof transaction:

```text
0xb44ca195f8d1fd175e6b1c67209731aedaf416d18a92216fb28ba3d0e5886497
```

The proof contract emits:

```text
PaymentRecorded(invoiceId, customerWallet, storeWallet, amount, points, timestamp)
```

## What Goes On-Chain

Only minimal public payment proof data should be written to Avalanche:

- Invoice ID
- Customer wallet
- Store receiver wallet
- Paid amount
- Points value for the proof event
- Timestamp emitted by the contract
- Payment proof transaction hash

The following data should stay off-chain in Supabase:

- Customer name
- Phone number
- Product list and order item details
- Staff name
- Internal store notes
- Inventory movements
- Private operational records

## Supabase + Avalanche Architecture

Supabase stores the main business data:

- Stores
- Store staff
- Products
- Warehouses
- Inventory
- Customers
- Orders
- Order items
- Payments
- APoint ledger

Avalanche stores only public proof data:

- Invoice ID
- Customer wallet
- Store receiver wallet
- Paid amount
- Points earned
- Timestamp

Private data such as customer names, phone numbers, product details, staff names, and full order contents should stay in Supabase and should not be written on-chain.

## Demo Screenshots

Screenshots can be added under `docs/images`.

Suggested placeholders:

- `docs/images/system-admin.png`
- `docs/images/store-pos.png`
- `docs/images/mobile-checkout.png`
- `docs/images/payment-confirmed.png`

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local `.env` file from `.env.example`:

```bash
copy .env.example .env
```

Start the dev server:

```bash
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://localhost:5173
```

## Environment Variables

Use `.env.example` as the source template. Do not commit private keys or secrets.

Required frontend variables:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_APOINT_PAYMENT_PROOF_ADDRESS=
VITE_AVAX_FUJI_CHAIN_ID=43113
VITE_AVAX_FUJI_USDC_ADDRESS=
VITE_WALLETCONNECT_PROJECT_ID=
```

Hardhat/deployment variables:

```env
FUJI_RPC_URL=
DEPLOYER_PRIVATE_KEY=
```

Never commit a real `DEPLOYER_PRIVATE_KEY`.

## Current Limitations

- WalletConnect support in progress.
- Mobile Chrome/Safari checkout requires WalletConnect configuration through `VITE_WALLETCONNECT_PROJECT_ID`.
- APoint redemption still needs final production rules and contract-level verification.
- Avalanche Fuji is for demo/testing only.
- Mainnet deployment, production RLS policies, and final security review are still required.

## Roadmap

- Finalize WalletConnect mobile checkout.
- Complete APoint redeem flow across all participating stores.
- Add stronger production Supabase RLS policies.
- Add Avalanche C-Chain mainnet support.
- Add production USDC configuration.
- Expand proof indexing and analytics.
- Prepare deployment documentation for store onboarding.
