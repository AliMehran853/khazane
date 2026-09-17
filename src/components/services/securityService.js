import db from '../db/database';

const KEYS = {
  LOCK_ENABLED: 'lockEnabled',
  PIN_ENABLED: 'pinEnabled',
  BIOMETRIC_ENABLED: 'biometricEnabled',
  PIN_HASH: 'pinHash',
  PIN_SALT: 'pinSalt',
  CREDENTIAL_ID: 'biometricCredentialId',
};

// ============================================================
// Settings helpers
// ============================================================

async function getSetting(key) {
  const row = await db.settings.get(key);
  return row?.value ?? null;
}

async function setSetting(key, value) {
  await db.settings.put({ key, value, updatedAt: Date.now() });
}

// ============================================================
// Hex/Buffer helpers
// ============================================================

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToUint8Array(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

// ============================================================
// PIN hashing (PBKDF2)
// ============================================================

async function derivePinHash(pin, saltBytes) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pin),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  return bufferToHex(derivedBits);
}

// ============================================================
// Lock flag
// ============================================================

export async function isLockEnabled() {
  return Boolean(await getSetting(KEYS.LOCK_ENABLED));
}

export async function setLockEnabled(enabled) {
  await setSetting(KEYS.LOCK_ENABLED, Boolean(enabled));
}

export async function isPinEnabled() {
  return Boolean(await getSetting(KEYS.PIN_ENABLED));
}

export async function isBiometricEnabled() {
  return Boolean(await getSetting(KEYS.BIOMETRIC_ENABLED));
}

export async function setBiometricEnabled(enabled) {
  await setSetting(KEYS.BIOMETRIC_ENABLED, Boolean(enabled));
}

// ============================================================
// PIN
// ============================================================

export async function hasPin() {
  const hash = await getSetting(KEYS.PIN_HASH);
  return Boolean(hash);
}

export async function setPin(pin) {
  const clean = String(pin).trim();
  if (!/^\d{4,6}$/.test(clean)) {
    throw new Error('رمز باید بین ۴ تا ۶ رقم باشد.');
  }

  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePinHash(clean, saltBytes);

  await setSetting(KEYS.PIN_HASH, hash);
  await setSetting(KEYS.PIN_SALT, bufferToHex(saltBytes));
  await setSetting(KEYS.PIN_ENABLED, true);
}

export async function verifyPin(pin) {
  const hash = await getSetting(KEYS.PIN_HASH);
  const saltHex = await getSetting(KEYS.PIN_SALT);
  if (!hash || !saltHex) return false;

  const saltBytes = hexToUint8Array(saltHex);
  const attempt = await derivePinHash(String(pin).trim(), saltBytes);
  return attempt === hash;
}

export async function clearPin() {
  await db.settings.delete(KEYS.PIN_HASH);
  await db.settings.delete(KEYS.PIN_SALT);
  await setSetting(KEYS.PIN_ENABLED, false);
}

// ============================================================
// WebAuthn
// ============================================================

export function isWebAuthnSupported() {
  return (
    typeof window !== 'undefined' &&
    window.PublicKeyCredential &&
    typeof window.PublicKeyCredential
      .isUserVerifyingPlatformAuthenticatorAvailable === 'function'
  );
}

export async function isBiometricAvailable() {
  if (!isWebAuthnSupported()) return false;

  try {
    const result = await Promise.race([
      window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(),
      new Promise((resolve) => setTimeout(() => resolve(false), 1200)),
    ]);
    return Boolean(result);
  } catch {
    return false;
  }
}

export async function hasBiometricCredential() {
  const id = await getSetting(KEYS.CREDENTIAL_ID);
  return Boolean(id);
}

export async function registerBiometric() {
  if (!isWebAuthnSupported()) {
    throw new Error('دستگاه شما از اثر انگشت پشتیبانی نمی‌کند.');
  }

  const available = await isBiometricAvailable();
  if (!available) {
    throw new Error('اثر انگشت روی این دستگاه فعال نیست.');
  }

  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const userId = crypto.getRandomValues(new Uint8Array(16));

  let credential;
  try {
    credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: 'خزانه',
          ...(window.location.hostname !== 'localhost' &&
            window.location.hostname !== '127.0.0.1' && {
              id: window.location.hostname,
            }),
        },
        user: {
          id: userId,
          name: 'khazane-user',
          displayName: 'کاربر خزانه',
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },
          { type: 'public-key', alg: -257 },
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred',
        },
        timeout: 60000,
        attestation: 'none',
      },
    });
  } catch (err) {
    console.error('WebAuthn register failed:', err);
    throw new Error('ثبت اثر انگشت لغو شد یا ناموفق بود.');
  }

  if (!credential) {
    throw new Error('ثبت اثر انگشت ناموفق بود.');
  }

  const credentialId = bufferToHex(credential.rawId);
  await setSetting(KEYS.CREDENTIAL_ID, credentialId);
  await setSetting(KEYS.BIOMETRIC_ENABLED, true);
  return credentialId;
}

export async function verifyBiometric() {
  const credentialIdHex = await getSetting(KEYS.CREDENTIAL_ID);
  if (!credentialIdHex) {
    throw new Error('اثر انگشتی ثبت نشده است.');
  }

  if (!isWebAuthnSupported()) {
    throw new Error('دستگاه شما از اثر انگشت پشتیبانی نمی‌کند.');
  }

  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const credentialId = hexToUint8Array(credentialIdHex);

  let assertion;
  try {
    assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        timeout: 60000,
        userVerification: 'required',
        allowCredentials: [
          {
            type: 'public-key',
            id: credentialId,
            transports: ['internal'],
          },
        ],
      },
    });
  } catch (err) {
    console.warn('WebAuthn verify failed:', err);
    return false;
  }

  return Boolean(assertion);
}

export async function clearBiometric() {
  await db.settings.delete(KEYS.CREDENTIAL_ID);
  await setSetting(KEYS.BIOMETRIC_ENABLED, false);
}