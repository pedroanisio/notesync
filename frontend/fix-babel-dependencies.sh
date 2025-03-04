#!/bin/bash
# Script to install Babel dependencies for Jest

echo "Installing Babel dependencies..."
npm install --save-dev @babel/core @babel/preset-env @babel/preset-react babel-jest

echo "Done! Try running your tests again with: npm test" 