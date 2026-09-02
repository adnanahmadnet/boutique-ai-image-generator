import crypto from "node:crypto";

const GROUP_COUNT = 4;
const GROUP_LENGTH = 4;
// Unambiguous alphabet — no 0/O or 1/I, easier to read aloud for support calls.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const PREFIX = "POSHAK";

function randomGroup(): string {
  const bytes = crypto.randomBytes(GROUP_LENGTH);
  let group = "";
  for (let i = 0; i < GROUP_LENGTH; i++) {
    group += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return group;
}

// Human-shareable entitlement key, e.g. POSHAK-7F3K-QW2M-8XZP-4NRT.
// This is a support/entitlement record shown in the buyer dashboard, not a
// technically-enforced activation key — nothing in the delivered ZIP
// (launcher, workflows) validates it programmatically today.
export function generateLicenseKey(): string {
  const groups = Array.from({ length: GROUP_COUNT }, randomGroup);
  return [PREFIX, ...groups].join("-");
}
