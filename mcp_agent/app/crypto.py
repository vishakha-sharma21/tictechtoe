"""AES-256-GCM, format `enc:v1:<iv b64>:<tag b64>:<ct b64>` — mirrors src/lib/crypto.ts."""
import base64
import os

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

_PREFIX = "enc:v1:"


def _key() -> bytes:
    hexkey = os.environ.get("ENCRYPTION_KEY", "")
    if len(hexkey) != 64:
        raise RuntimeError("ENCRYPTION_KEY must be 64 hex chars")
    return bytes.fromhex(hexkey)


def decrypt(payload: str) -> str:
    if not payload.startswith(_PREFIX):
        raise ValueError("Not an encrypted payload")
    iv, tag, ct = (base64.b64decode(p) for p in payload[len(_PREFIX):].split(":"))
    # cryptography expects ciphertext || tag
    return AESGCM(_key()).decrypt(iv, ct + tag, None).decode("utf-8")


def encrypt(plain: str) -> str:
    iv = os.urandom(12)
    out = AESGCM(_key()).encrypt(iv, plain.encode("utf-8"), None)
    ct, tag = out[:-16], out[-16:]
    b64 = lambda b: base64.b64encode(b).decode()
    return f"{_PREFIX}{b64(iv)}:{b64(tag)}:{b64(ct)}"
