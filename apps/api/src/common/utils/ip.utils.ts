import type { Request } from 'express';

export function normalizeIp(raw: string | undefined): string {
  if (!raw) return '0.0.0.0';
  let ip = raw.trim();
  if (ip.startsWith('::ffff:')) {
    ip = ip.slice(7);
  }
  if (ip === '::1') {
    return '127.0.0.1';
  }
  return ip;
}

export function extractIp(req: Request, trustProxy: boolean): string {
  if (trustProxy) {
    const xff = req.headers['x-forwarded-for'];
    if (typeof xff === 'string' && xff.length > 0) {
      const first = xff.split(',')[0]?.trim();
      if (first) return normalizeIp(first);
    }
  }
  const socketAddr = req.socket.remoteAddress;
  return normalizeIp(socketAddr);
}

export function isPrivateOrLocalIp(ip: string): boolean {
  if (ip === '127.0.0.1' || ip === '0.0.0.0' || ip === '::1') return true;
  if (ip.startsWith('10.')) return true;
  if (ip.startsWith('192.168.')) return true;
  if (ip.startsWith('169.254.')) return true;
  const parts = ip.split('.').map(Number);
  if (parts.length === 4 && parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) {
    return true;
  }
  if (ip.includes(':')) {
    const lower = ip.toLowerCase();
    if (
      lower.startsWith('fc') ||
      lower.startsWith('fd') ||
      lower.startsWith('fe80')
    ) {
      return true;
    }
  }
  return false;
}

export function ipVersion(ip: string): 4 | 6 {
  return ip.includes(':') ? 6 : 4;
}
