import { SYSTEM_ADMIN_WALLET, STORE_WALLETS } from './storeNetwork.js';

export const MANAGER_WALLET = SYSTEM_ADMIN_WALLET;

export const DEFAULT_STAFF_WALLETS = [
  {
    id: 'system-admin-wallet',
    name: 'System Admin',
    role: 'System Admin',
    roleKey: 'system_admin',
    wallet: SYSTEM_ADMIN_WALLET,
    avatar: 'SA',
    active: true,
  },
  {
    id: 'grocery-owner-wallet',
    name: 'Grocery Owner',
    role: 'Owner',
    roleKey: 'owner',
    wallet: STORE_WALLETS.grocery.owner,
    avatar: 'GO',
    active: true,
  },
  {
    id: 'grocery-staff-wallet',
    name: 'Grocery Cashier',
    role: 'Cashier',
    roleKey: 'cashier',
    wallet: STORE_WALLETS.grocery.staff,
    avatar: 'GC',
    active: true,
  },
];

export function normalizeWallet(wallet = '') {
  return String(wallet || '').trim().toLowerCase();
}

export function ensureStaffArray(staffMembers) {
  return Array.isArray(staffMembers) ? staffMembers : DEFAULT_STAFF_WALLETS;
}

export function findWhitelistedStaffByWallet(staffMembers = DEFAULT_STAFF_WALLETS, wallet = '') {
  const list = ensureStaffArray(staffMembers);
  const normalizedWallet = normalizeWallet(wallet);

  if (!normalizedWallet) {
    return null;
  }

  return (
    list.find(member => {
      const memberWallet = normalizeWallet(member?.wallet);
      const isActive = member?.active !== false;

      return memberWallet === normalizedWallet && isActive;
    }) || null
  );
}

export function isWhitelistedStaffWallet(wallet = '', staffMembers = DEFAULT_STAFF_WALLETS) {
  return Boolean(findWhitelistedStaffByWallet(staffMembers, wallet));
}

export function isManagerWallet(wallet = '', staff = null) {
  const normalizedWallet = normalizeWallet(wallet);

  if (!normalizedWallet) {
    return false;
  }

  if (normalizedWallet === normalizeWallet(MANAGER_WALLET)) {
    return true;
  }

  const role = String(staff?.role || staff?.roleKey || '').toLowerCase();

  return ['manager', 'owner', 'store_owner', 'system_admin'].includes(role);
}

export function rolePermissionLabel(isManager, roleLabel = '') {
  if (roleLabel) return roleLabel;
  return isManager ? 'Manager: full edit access' : 'Staff: POS access only';
}
