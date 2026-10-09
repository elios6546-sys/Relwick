import { SourceCategory } from '@relwick/shared';
import { classifySource } from './source.utils';

describe('classifySource', () => {
  it('direct sans referrer', () => {
    expect(classifySource({ referrer: '' })).toBe(SourceCategory.DIRECT);
  });

  it('recherche Google', () => {
    expect(
      classifySource({ referrer: 'https://www.google.com/search?q=relwick' }),
    ).toBe(SourceCategory.SEARCH);
  });

  it('WhatsApp', () => {
    expect(classifySource({ referrer: 'https://wa.me/243975993035' })).toBe(
      SourceCategory.WHATSAPP,
    );
  });

  it('réseaux sociaux Facebook', () => {
    expect(classifySource({ referrer: 'https://www.facebook.com/ads' })).toBe(
      SourceCategory.SOCIAL,
    );
  });

  it('campagne UTM', () => {
    expect(
      classifySource({
        referrer: 'https://example.com',
        utmSource: 'newsletter',
      }),
    ).toBe(SourceCategory.CAMPAIGN);
  });

  it('referral autre site', () => {
    expect(classifySource({ referrer: 'https://partner.example.org/page' })).toBe(
      SourceCategory.REFERRAL,
    );
  });
});
