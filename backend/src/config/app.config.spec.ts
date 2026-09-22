import { getAppConfig, resetAppConfigCache } from './app.config';

const BASE_ENV = {
  DATABASE_URL: 'mysql://root@localhost:3306/mjm_store_test',
  JWT_SECRET: 'test-secret-at-least-16-chars',
  JWT_REFRESH_SECRET: 'test-refresh-secret-16-chars',
};

describe('getAppConfig', () => {
  beforeEach(() => resetAppConfigCache());

  it('applies defaults', () => {
    const config = getAppConfig({ ...BASE_ENV });
    expect(config.PORT).toBe(3001);
    expect(config.NODE_ENV).toBe('development');
    expect(config.PUBLIC_URL).toBe('http://localhost:3001');
  });

  it('rejects missing secrets fast', () => {
    expect(() => getAppConfig({ ...BASE_ENV, JWT_SECRET: 'short' })).toThrow(
      /JWT_SECRET/,
    );
  });

  it('rejects missing DATABASE_URL', () => {
    const { DATABASE_URL: _removed, ...rest } = BASE_ENV;
    expect(_removed).toBeDefined();
    expect(() => getAppConfig({ ...rest })).toThrow(/DATABASE_URL/);
  });
});
