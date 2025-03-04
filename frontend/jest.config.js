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
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!react-markdown|rehype-highlight|micromark|unist|mdast|unified|bail|trough|remark|remark-gfm|hast|property-information|space-separated-tokens|comma-separated-tokens|is-plain-obj|lowlight|fault|vfile|escape-string-regexp|decode-named-character-reference|character-entities|character-entities-legacy|character-reference-invalid|is-decimal|is-hexadecimal|is-alphanumerical|is-alphabetical|stringify-entities).+\\.js$'
  ]
}; 