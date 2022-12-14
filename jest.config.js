/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  testRegex: ["(test|spec)\\.[jt]sx?$"],
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  modulePathIgnorePatterns: [
    '<rootDir>/packages/react-query/__tests__/rapper3',
    '<rootDir>/packages/react-query3/__tests__/rapper3',
  ],
  verbose: false,
}
