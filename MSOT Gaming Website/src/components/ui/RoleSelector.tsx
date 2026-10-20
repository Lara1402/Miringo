import { motion } from 'motion/react';
import { GraduationCap } from 'lucide-react';
import type { RequestedRole } from '../../types';

interface RoleSelectorProps {
  value: RequestedRole;
  onChange: (role: RequestedRole) => void;
  error?: string;
}

const roles = [
  {
    value: 'student' as const,
    label: 'Student',
    description: 'Access gamified courses, quests, and coding challenges',
    icon: GraduationCap,
  },
];

export function RoleSelector({ value, onChange, error }: RoleSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">Account Type</label>
      <div className="grid grid-cols-2 gap-3">
        {roles.map((role) => {
          const isSelected = value === role.value;
          const Icon = role.icon;
          return (
            <motion.button
              key={role.value}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(role.value)}
              className={`relative flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all duration-200 cursor-pointer
                ${isSelected
                  ? 'border-cyan-500/50 bg-cyan-500/10 text-white'
                  : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:bg-white/[0.04]'
                }`}
              aria-pressed={isSelected}
              role="radio"
              aria-checked={isSelected}
            >
              <Icon className={`w-5 h-5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span className="text-sm font-medium">{role.label}</span>
              <span className="text-xs text-slate-500">{role.description}</span>
              {isSelected && (
                <motion.div
                  layoutId="role-indicator"
                  className="absolute inset-0 rounded-xl border-2 border-cyan-500/30"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
      {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
    </div>
  );
}
