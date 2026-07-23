/**
 * Environment resolver.
 *
 * This framework tests a DEPLOYED application. There are no local servers
 * to boot -- every environment is just a pair of URLs.
 *
 * Select with ENV (default "prod"):
 *   ENV=prod npm test
 *
 * Override either URL from the shell or Jenkins without touching code:
 *   BASE_URL=https://staging.example API_URL=https://staging.example/api npm test
 */

export type EnvName = 'prod' | 'qa';

export interface EnvConfig {
  name: EnvName;
  /** URL of the deployed frontend. Must end with a slash. */
  baseURL: string;
  /** REST API root, e.g. https://host/api */
  apiURL: string;
}

const ENV = (process.env.ENV || 'prod').toLowerCase() as EnvName;

const CONFIGS: Record<EnvName, EnvConfig> = {
  prod: {
    name: 'prod',
    baseURL: 'https://buildbuddy50.github.io/novastore/',
    apiURL: 'https://novastore-fk1k.onrender.com/api',
  },
  qa: {
    name: 'qa',
    baseURL: 'https://buildbuddy50.github.io/novastore/',
    apiURL: 'https://novastore-fk1k.onrender.com/api',
  },
};

const selected = CONFIGS[ENV] ?? CONFIGS.prod;

/** Guarantee a trailing slash so relative paths resolve inside the app. */
const withSlash = (u: string): string => (u.endsWith('/') ? u : `${u}/`);

export const env: EnvConfig = {
  ...selected,
  baseURL: withSlash(process.env.BASE_URL || selected.baseURL),
  apiURL: (process.env.API_URL || selected.apiURL).replace(/\/$/, ''),
};

/** Admin account seeded by the API on first run. */
export const ADMIN = {
  email: process.env.ADMIN_EMAIL || 'admin@nova.com',
  password: process.env.ADMIN_PASSWORD || 'admin123',
};

/**
 * Free-tier hosts sleep when idle and can take ~30s to answer the first
 * request. Waits are sized accordingly.
 */
export const TIMEOUTS = {
  /** First paint / data load after a possible cold start. */
  pageLoad: 60_000,
  /** Normal interaction once the app is warm. */
  action: 15_000,
  /** A single expect() poll window. */
  assertion: 15_000,
};
