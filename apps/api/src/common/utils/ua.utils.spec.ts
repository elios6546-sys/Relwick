import { DeviceType } from '@relwick/shared';
import { parseUserAgent } from './ua.utils';

describe('parseUserAgent', () => {
  it('Android mobile', () => {
    const r = parseUserAgent(
      'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
    );
    expect(r.deviceType).toBe(DeviceType.MOBILE);
    expect(r.os).toBe('Android');
  });

  it('Windows desktop Chrome', () => {
    const r = parseUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    );
    expect(r.deviceType).toBe(DeviceType.DESKTOP);
    expect(r.browser).toBe('Chrome');
  });

  it('Googlebot', () => {
    const r = parseUserAgent(
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    );
    expect(r.isBot).toBe(true);
  });
});
