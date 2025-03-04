#!/bin/bash
# Script to fix React version incompatibilities

echo "Removing node_modules..."
rm -rf node_modules

echo "Removing package-lock.json..."
rm -f package-lock.json

echo "Installing correct dependencies..."
npm install

echo "Installing correct testing dependencies..."
npm install --save-dev @testing-library/jest-dom@5.16.5 @testing-library/react@13.4.0 @testing-library/user-event@14.4.3 jest@29.3.1 jest-environment-jsdom@29.3.1

echo "Cleaning npm cache..."
npm cache clean --force

echo "Reinstalling all dependencies..."
npm install

echo "Checking React version..."
npm ls react

echo "Done! Try running your tests again with: npm test" 