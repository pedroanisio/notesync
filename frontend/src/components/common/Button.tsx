import React from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  disabled = false, 
  variant = 'primary' 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`button button-${variant}`}
    >
      {label}
    </button>
  );
};

export default Button; 