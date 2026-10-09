function ipToBigInt(ip: string): bigint | null {
  if (ip.includes(':')) {
    return null;
  }
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) {
    return null;
  }
  return (
    (BigInt(parts[0]!) << 24n) |
    (BigInt(parts[1]!) << 16n) |
    (BigInt(parts[2]!) << 8n) |
    BigInt(parts[3]!)
  );
}

function parseCidr(entry: string): { network: bigint; mask: bigint } | null {
  const trimmed = entry.trim();
  if (!trimmed.includes('/')) {
    const ip = ipToBigInt(trimmed);
    if (ip === null) return null;
    return { network: ip, mask: 0xffffffffn };
  }
  const [ipPart, prefixStr] = trimmed.split('/');
  const prefix = Number(prefixStr);
  if (!ipPart || Number.isNaN(prefix) || prefix < 0 || prefix > 32) return null;
  const ip = ipToBigInt(ipPart);
  if (ip === null) return null;
  const mask = prefix === 0 ? 0n : (~0n << BigInt(32 - prefix)) & 0xffffffffn;
  return { network: ip & mask, mask };
}

export function ipMatchesCidr(ip: string, cidr: string): boolean {
  const target = ipToBigInt(ip);
  const parsed = parseCidr(cidr);
  if (target === null || parsed === null) {
    return ip.trim() === cidr.trim();
  }
  return (target & parsed.mask) === parsed.network;
}

export function isIpExcluded(ip: string, excluded: string[]): boolean {
  for (const entry of excluded) {
    if (!entry.trim()) continue;
    if (entry.includes('/')) {
      if (ipMatchesCidr(ip, entry)) return true;
    } else if (ip === entry.trim()) {
      return true;
    }
  }
  return false;
}
