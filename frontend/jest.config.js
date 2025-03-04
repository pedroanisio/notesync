module.exports = {
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/src/**/*.test.js',
    '<rootDir>/src/**/*.spec.js'
  ],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!react-markdown|rehype-highlight|micromark|unist|mdast|unified|bail|trough|remark|remark-gfm|hast|property-information|space-separated-tokens|comma-separated-tokens|is-plain-obj|lowlight|fault|vfile|escape-string-regexp|decode-named-character-reference|character-entities|character-entities-legacy|character-reference-invalid|is-decimal|is-hexadecimal|is-alphanumerical|is-alphabetical|stringify-entities|trim-lines|trim|mdast-util-to-string|mdast-util-to-hast|mdast-util-from-markdown|markdown-table|extend|html-void-elements|ccount|markdown-table|zwitch).+\\.js$'
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/tests/e2e/"  // Exclude e2e tests that require Playwright
  ],
  testTimeout: 15000  // Increase timeout to 15 seconds
}; 