import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../stores/themeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-card-border text-on-surface transition-all duration-200 hover:shadow-glow focus:outline-none"
      title={`Switch to ${theme === 'dark' ? 'Apex Luxury Light' : 'High-Performance Dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-tertiary transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-5 h-5 text-primary transition-transform duration-300 -rotate-12" />
      )}
    </button>
  );
}
