import type { Request } from 'express';
import { extractIp, normalizeIp, isPrivateOrLocalIp } from './ip.utils';

describe('ip.utils', () => {
  it('normalise ::ffff:', () => {
    expect(normalizeIp('::ffff:192.168.1.10')).toBe('192.168.1.10');
  });

  it('normalise ::1', () => {
    expect(normalizeIp('::1')).toBe('127.0.0.1');
  });

  it('extrait sans proxy', () => {
    const req = {
      headers: { 'x-forwarded-for': '8.8.8.8, 1.1.1.1' },
      socket: { remoteAddress: '127.0.0.1' },
    } as unknown as Request;
    expect(extractIp(req, false)).toBe('127.0.0.1');
  });

  it('extrait avec proxy', () => {
    const req = {
      headers: { 'x-forwarded-for': '8.8.8.8, 1.1.1.1' },
      socket: { remoteAddress: '127.0.0.1' },
    } as unknown as Request;
    expect(extractIp(req, true)).toBe('8.8.8.8');
  });

  it('détecte IP privées', () => {
    expect(isPrivateOrLocalIp('192.168.0.5')).toBe(true);
    expect(isPrivateOrLocalIp('8.8.8.8')).toBe(false);
  });
});
