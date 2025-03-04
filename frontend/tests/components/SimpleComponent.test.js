import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// A simple test component that doesn't depend on any app code
const SimpleTestComponent = ({ text = 'Hello, world!' }) => {
  return <div data-testid="simple-component">{text}</div>;
};

describe('Simple Component Test', () => {
  test('renders with default text', () => {
    render(<SimpleTestComponent />);
    expect(screen.getByTestId('simple-component')).toHaveTextContent('Hello, world!');
  });

  test('renders with custom text', () => {
    render(<SimpleTestComponent text="Custom text" />);
    expect(screen.getByTestId('simple-component')).toHaveTextContent('Custom text');
  });
}); 