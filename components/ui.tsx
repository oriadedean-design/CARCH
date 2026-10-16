import React from 'react';
import { clsx } from 'clsx';
import { Loader2, X } from 'lucide-react';

/**
 * CINEARCH CANONICAL EDITORIAL ARCHITECTURE
 * - Preserves the authentic architectural, sharp-cornered (rounded-none) cinema terminal design language.
 * - Uses Instrument Serif (italic display) and Spline Sans (technical uppercase tracking).
 * - Calibrated for iPhone touch targets (min 48px / HIG 44pt compliant) and 16px inputs (prevents iOS auto-zoom).
 */

export const Heading = ({ children, level = 1, className }: { children?: React.ReactNode, level?: 1 | 2 | 3 | 4, className?: string }) => {
  const styles = {
    1: "heading-huge text-white mb-6",
    2: "font-serif italic text-3xl sm:text-5xl text-white tracking-tighter mb-4 leading-[0.88]",
    3: "font-serif italic text-2xl sm:text-3xl text-white tracking-tight leading-tight mb-2",
    4: "font-sans font-black uppercase tracking-[0.45em] text-[10px] sm:text-[11px] text-accent italic"
  };
  const Tag = `h${level}` as React.ElementType;
  return <Tag className={clsx(styles[level], className)}>{children}</Tag>;
};

export const Text = ({ children, className, variant = "body", uppercase = false }: { children?: React.ReactNode, className?: string, variant?: "body" | "subtle" | "small" | "caption", uppercase?: boolean }) => {
  const styles = {
    body: "text-sm sm:text-base text-white/90 font-light leading-relaxed italic", 
    subtle: "text-xs sm:text-sm text-white/60 font-light leading-relaxed italic", 
    small: "text-[13px] text-white/50 leading-snug font-light italic", 
    caption: "text-[9px] sm:text-[10px] font-black tracking-[0.5em] text-accent uppercase italic"
  };
  return <p className={clsx(styles[variant], uppercase && "uppercase", className)}>{children}</p>;
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'glass';
  isLoading?: boolean;
  className?: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'submit' | 'reset' | 'button';
}

export const Button = ({ children, variant = 'primary', className, isLoading, disabled, ...props }: ButtonProps) => {
  const variants = {
    primary: "bg-white text-black hover:bg-accent active:bg-accent/90 transition-all duration-300 shadow-[0_4px_16px_rgba(255,255,255,0.1)]",
    secondary: "bg-white/10 text-white hover:bg-white hover:text-black border border-white/30 active:scale-[0.98]",
    outline: "bg-transparent border border-white/30 text-white hover:border-accent hover:text-accent active:bg-white/5",
    ghost: "bg-transparent text-white/70 hover:text-white hover:bg-white/10 active:scale-[0.98]",
    danger: "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white active:scale-[0.98]",
    glass: "glass-ui text-white hover:bg-white/15 active:scale-[0.98]"
  };

  return (
    <button 
      className={clsx(
        "inline-flex items-center justify-center px-6 sm:px-10 py-3.5 min-h-[48px] text-[11px] font-black uppercase tracking-[0.45em] transition-all duration-300 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed select-none rounded-none border border-transparent italic",
        variants[variant],
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-3 animate-spin" />}
      {children}
    </button>
  );
};

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={clsx(
        "w-full px-5 py-3.5 bg-white/[0.05] border border-white/20 text-white text-[16px] focus:outline-none focus:border-accent transition-all placeholder:text-white/25 backdrop-blur-3xl rounded-none font-light italic min-h-[50px]",
        className
      )}
      {...props}
    />
  );
});

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...props }, ref) => {
  return (
    <div className="relative group">
      <select
        ref={ref}
        className={clsx(
          "w-full px-5 py-3.5 bg-white/[0.05] border border-white/20 text-white text-[16px] focus:outline-none focus:border-accent transition-all backdrop-blur-3xl rounded-none font-light italic appearance-none cursor-pointer min-h-[50px] pr-10",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/50 group-hover:text-accent transition-colors">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
});

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  key?: React.Key;
}

export const Card = ({ children, className, onClick, ...props }: CardProps) => {
  return (
    <div 
      {...props}
      onClick={onClick} 
      className={clsx(
        "glass-ui p-5 sm:p-7 relative overflow-hidden group transition-all duration-500 rounded-none border border-white/15", 
        className, 
        onClick && "cursor-pointer hover:border-accent/40 active:bg-white/[0.02] active:scale-[0.99] select-none"
      )}
    >
      {children}
    </div>
  );
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  color?: "neutral" | "success" | "blue" | "accent" | "danger";
  className?: string;
  key?: React.Key;
}

export const Badge = ({ children, color = "neutral", className, ...props }: BadgeProps) => {
  const colors = {
    neutral: "bg-white/10 text-white/80 border-white/25",
    success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
    blue: "bg-blue-500/15 text-blue-300 border-blue-500/40",
    accent: "bg-accent/15 text-accent border-accent/50",
    danger: "bg-red-500/15 text-red-300 border-red-500/40"
  };
  return (
    <span 
      {...props}
      className={clsx("inline-flex items-center px-3 py-1 border text-[9px] font-black uppercase tracking-[0.35em] rounded-none italic select-none", colors[color], className)}
    >
      {children}
    </span>
  );
};

export const ProgressBar = ({ progress, className }: { progress: number, className?: string }) => {
  return (
    <div className={clsx("w-full bg-white/10 overflow-hidden h-[4px] rounded-none", className)}>
      <div 
        className="h-full bg-accent transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(250,204,21,0.6)] rounded-none" 
        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
      />
    </div>
  );
};

/**
 * CINEARCH EDITORIAL SHUTTER SHEET
 * Slides up from bottom with sharp architectural borders, safe-area clearance, and momentum scroll
 */
export const IOSSheet = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col justify-end">
      {/* Dimmed backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Sliding Shutter Container */}
      <div 
        className="relative z-10 w-full max-w-[480px] mx-auto bg-black/95 border-t-2 border-white/20 shadow-2xl overflow-hidden max-h-[88dvh] flex flex-col animate-in slide-in-from-bottom duration-300 rounded-none"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
      >
        {/* Shutter Accent Bar */}
        <div className="h-[2px] w-full bg-accent/40" />

        {/* Sheet Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-accent block italic">
              {subtitle || "TERMINAL ACTION"}
            </span>
            <h3 className="font-serif italic text-2xl text-white leading-tight">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 border border-white/10 text-white/40 hover:text-white active:scale-90 transition-all rounded-none"
            aria-label="Close sheet"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Sheet Content with iOS Momentum */}
        <div className="p-6 overflow-y-auto ios-momentum-scroll flex-1 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};
