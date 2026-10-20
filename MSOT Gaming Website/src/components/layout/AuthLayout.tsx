import { type ReactNode } from 'react';
import { motion } from 'motion/react';
import { AlertCircle } from 'lucide-react';
import { ParticleField } from '../animation/ParticleField';
import { isConfigured } from '../../lib/supabase';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: 'radial-gradient(ellipse at top, #1a1205 0%, #0a0a08 50%, #080808 100%)' }}
    >
      <ParticleField />

      {/* Ambient light effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(247, 148, 29, 0.12), transparent)' }}
      />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(251, 191, 36, 0.1), transparent)' }}
      />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Setup notice if credentials not yet supplied */}
        {!isConfigured && (
          <motion.div
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs space-y-1.5"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-1.5 font-semibold text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Supabase Key Required</span>
            </div>
            <p>
              Please provide your real <code className="bg-black/30 px-1 py-0.5 rounded">VITE_SUPABASE_PUBLISHABLE_KEY</code> in <code className="bg-black/30 px-1 py-0.5 rounded">.env</code> to connect authentication to your live project.
            </p>
          </motion.div>
        )}

        {/* GTA V MSOT Logo */}
        <motion.div
          className="flex flex-col items-center justify-center mb-8 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2">
            <span className="font-pricedown text-5xl md:text-6xl text-white gta-text-shadow tracking-tight">
              MSOT <span className="text-[#F7941D]">V</span>
            </span>
          </div>
          <span className="text-[11px] font-mono font-black tracking-widest uppercase text-amber-400/90 mt-1">
            LOS SANTOS : CAMPUS EDITION
          </span>
        </motion.div>

        {/* Title/Subtitle */}
        {title && (
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-2xl font-chalet font-black uppercase tracking-wider gta-text-shadow text-white mb-1">{title}</h1>
            {subtitle && <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">{subtitle}</p>}
          </motion.div>
        )}

        {children}
      </motion.div>
    </div>
  );
}
