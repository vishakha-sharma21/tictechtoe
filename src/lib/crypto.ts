import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

// AES-256-GCM. Format: enc:v1:<iv b64>:<tag b64>:<ciphertext b64>
// mcp_agent/app/crypto.py implements the same format — keep them in sync.
const PREFIX = 'enc:v1:'

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY
  if (!hex || !/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error('ENCRYPTION_KEY must be 64 hex chars (openssl rand -hex 32)')
  }
  return Buffer.from(hex, 'hex')
}

export function encrypt(plain: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', getKey(), iv)
  const ct = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${PREFIX}${iv.toString('base64')}:${tag.toString('base64')}:${ct.toString('base64')}`
}

export function decrypt(payload: string): string {
  if (!payload.startsWith(PREFIX)) throw new Error('Not an encrypted payload')
  const [iv, tag, ct] = payload.slice(PREFIX.length).split(':')
  const decipher = createDecipheriv('aes-256-gcm', getKey(), Buffer.from(iv, 'base64'))
  decipher.setAuthTag(Buffer.from(tag, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(ct, 'base64')), decipher.final()]).toString('utf8')
}
