/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testPathIgnorePatterns: ['/node_modules/', '/dist/']
};
