// Both builds must exist before running the suite (see README.md).
export const BUILDS = {
  angular: { dir: '../dist/angular-hnpwa', port: 4201 },
  react: { dir: '../react/dist', port: 4202 },
} as const;

export type BuildName = keyof typeof BUILDS;
export const baseURL = (build: BuildName) => `http://localhost:${BUILDS[build].port}`;
