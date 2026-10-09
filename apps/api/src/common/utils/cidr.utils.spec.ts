import { ipMatchesCidr, isIpExcluded } from './cidr.utils';

describe('cidr.utils', () => {
  it('match IP exacte', () => {
    expect(isIpExcluded('192.0.2.5', ['192.0.2.5'])).toBe(true);
    expect(isIpExcluded('192.0.2.6', ['192.0.2.5'])).toBe(false);
  });

  it('match CIDR documentation', () => {
    expect(ipMatchesCidr('192.0.2.44', '192.0.2.0/24')).toBe(true);
    expect(ipMatchesCidr('192.0.3.1', '192.0.2.0/24')).toBe(false);
  });

  it('liste mixte', () => {
    expect(
      isIpExcluded('198.51.100.10', ['203.0.113.0/24', '198.51.100.0/24']),
    ).toBe(true);
  });
});
