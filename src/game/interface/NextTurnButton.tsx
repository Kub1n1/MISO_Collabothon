import React from 'react';
import './NextTurnButton.css';

interface NextTurnButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export const NextTurnButton: React.FC<NextTurnButtonProps> = ({
  onClick,
  disabled = false,
  label = 'NEXT TURN',
  className,
}) => {
  return (
    <button
      className={`game-btn-red${className ? ` ${className}` : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="game-btn-text">{label}</span>
      {/* Opcjonalna strzałka w stylu Twoich ikon */}
      <svg
        className="game-btn-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14M13 5l7 7-7 7" />
      </svg>
    </button>
  );
};