'use strict';

const ROUNDS = 800;

function toHex_(bytes) {
  return bytes.map((byte) => ((byte + 256) % 256).toString(16).padStart(2, '0')).join('');
}

function derive_(password, salt, rounds) {
  let value = `${salt}:${password}`;
  for (let index = 0; index < rounds; index += 1) {
    value = toHex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value));
  }
  return value;
}

function hashPassword(password) {
  const salt = Utilities.getUuid().replace(/-/g, '');
  return `sha256$${ROUNDS}$${salt}$${derive_(password, salt, ROUNDS)}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.startsWith('sha256$')) return false;
  const parts = stored.split('$');
  if (parts.length !== 4) return false;
  const rounds = Number(parts[1]);
  if (!Number.isFinite(rounds) || rounds < 1 || rounds > 5000) return false;
  const derived = derive_(password, parts[2], rounds);
  if (derived.length !== parts[3].length) return false;
  let mismatch = 0;
  for (let index = 0; index < derived.length; index += 1) {
    mismatch |= derived.charCodeAt(index) ^ parts[3].charCodeAt(index);
  }
  return mismatch === 0;
}

module.exports = { hashPassword, verifyPassword };
