/** Variables minimales pour les tests e2e (validation ConfigModule). */
const env: Record<string, string> = {
  NODE_ENV: 'test',
  PORT: '4000',
  DATABASE_URL: 'mysql://root:@localhost:3306/relwick_test',
  WEB_ORIGIN: 'http://localhost:3000',
  TRUST_PROXY: 'false',
  JWT_ACCESS_SECRET: 'test-access-secret-minimum-32-characters-long',
  JWT_REFRESH_SECRET: 'test-refresh-secret-minimum-32-characters-long',
  COOKIE_DOMAIN: 'localhost',
  COOKIE_SECURE: 'false',
  ADMIN_EMAIL: 'admin@test.local',
  ADMIN_PASSWORD: 'test-password-min-8',
  ADMIN_NAME: 'Test Admin',
  GEOIP_CITY_DB: './geo/GeoLite2-City.mmdb',
  GEOIP_ASN_DB: './geo/GeoLite2-ASN.mmdb',
  DEV_FAKE_IP: '',
  RETENTION_DAYS: '395',
  APP_TIMEZONE: 'Africa/Lubumbashi',
};

for (const [key, value] of Object.entries(env)) {
  process.env[key] = value;
}
