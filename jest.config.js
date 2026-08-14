module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
  moduleNameMapper: {
    '^uncrypto$': '<rootDir>/tests/__mocks__/uncryptoMock.js',
    '^swiper/css.*$': '<rootDir>/tests/__mocks__/styleMock.js',
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/tests/e2e/', '<rootDir>/tests/smoke.spec.ts', '.*\\.spec\\.ts$'],
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
};
