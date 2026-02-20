'use client';

import { ReactNode } from 'react';

interface TerminalBoxProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function TerminalBox({ title, children, className = '' }: TerminalBoxProps) {
  return (
    <div className={`terminal-box ${className}`}>
      {title && (
        <div className="terminal-header">
          <span className="terminal-title">[ {title} ]</span>
        </div>
      )}
      <div className="terminal-content">
        {children}
      </div>
    </div>
  );
}

export function TerminalButton({
  children,
  onClick,
  disabled,
  variant = 'default',
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger' | 'success';
  className?: string;
}) {
  const variantClasses = {
    default: 'hover:bg-terminal-green hover:text-black',
    danger: 'text-red-500 border-red-500 hover:bg-red-500 hover:text-black',
    success: 'hover:bg-terminal-green hover:text-black',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`terminal-button ${variantClasses?.[variant] ?? variantClasses.default} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
}

export function TerminalInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange?.(e?.target?.value ?? '')}
      placeholder={placeholder}
      className={`terminal-input ${className}`}
    />
  );
}

export function TerminalSelect({
  value,
  onChange,
  options,
  className = '',
}: {
  value: string | number;
  onChange: (value: string) => void;
  options: { value: string | number; label: string }[];
  className?: string;
}) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange?.(e?.target?.value ?? '')}
      className={`terminal-select ${className}`}
    >
      {(options ?? [])?.map?.((opt) => (
        <option key={opt?.value} value={opt?.value}>
          {opt?.label ?? ''}
        </option>
      ))}
    </select>
  );
}

export function LoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 text-terminal-green">
      <span className="animate-spin">[◐]</span>
      <span>{text}</span>
    </div>
  );
}

export function AsciiDivider() {
  return (
    <div className="text-terminal-green opacity-50 select-none overflow-hidden">
      ════════════════════════════════════════════════════════════
    </div>
  );
}
