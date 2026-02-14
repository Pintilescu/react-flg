import { randomBytes, createHash } from 'crypto';

export function generateApiKeys(envSlug: string): {
  fullKey: string;
  keyHash: string;
  keyPrefix: string;
} {
  const fullKey = `crv_${envSlug}_${randomBytes(24).toString('hex')}`;
  const keyHash = createHash('sha256').update(fullKey).digest('hex');
  const keyPrefix = fullKey.substring(0, 8);

  return { fullKey, keyHash, keyPrefix };
}
