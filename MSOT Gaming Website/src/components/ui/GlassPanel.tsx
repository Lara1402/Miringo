import { type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';

interface GlassPanelProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}

export function GlassPanel({ children, className = '', glow = true, ...props }: GlassPanelProps) {
  return (
    <motion.div
      className={`relative gta-card shadow-2xl ${className}`}
      style={{
        boxShadow: glow
          ? '0 0 0 1px rgba(245, 158, 11, 0.08), 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 60px -10px rgba(245, 158, 11, 0.12)'
          : '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}
      {...props}
    >
      {/* Top gradient line */}
      {glow && (
        <div
          className="absolute top-0 left-[10%] right-[10%] h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.5), rgba(251, 191, 36, 0.4), transparent)',
          }}
        />
      )}
      {children}
    </motion.div>
  );
}
