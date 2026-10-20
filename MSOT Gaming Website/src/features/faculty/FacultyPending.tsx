import { motion } from 'motion/react';
import { Clock, XCircle, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { GlassPanel } from '../../components/ui/GlassPanel';
import { useAuth } from '../../hooks/useAuth';

export function FacultyPending() {
  const { profile } = useAuth();
  const isRejected = profile?.approval_status === 'rejected';

  return (
    <DashboardLayout
      title={isRejected ? 'CLEARANCE DENIED' : 'CLEARANCE PENDING'}
      subtitle={isRejected ? 'Handler clearance revoked by command' : 'Awaiting authorization from command center'}
    >
      <div className="max-w-lg mx-auto">
        <GlassPanel className="p-8 border-zinc-800 bg-black/60" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.4 }}
            >
              {isRejected ? (
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto animate-pulse-glow">
                  <Clock className="w-8 h-8 text-amber-400" />
                </div>
              )}
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-xl font-chalet font-black text-white uppercase tracking-wider gta-text-shadow">
                {isRejected ? 'ACCESS REVOKED' : 'AWAITING CLEARANCE'}
              </h2>
              <p className="text-zinc-400 text-xs font-mono">
                {isRejected
                  ? 'Unfortunately, your faculty application has been reviewed and was not approved at this time. Please contact an administrator if you have questions.'
                  : 'Your faculty application is currently being reviewed by an administrator. You will gain access to faculty features once your application is approved.'}
              </p>
            </div>

            <div className={`rounded-lg p-4 text-sm ${
              isRejected
                ? 'bg-red-500/10 border border-red-500/20'
                : 'bg-amber-500/10 border border-amber-500/20'
            }`}>
              <div className="flex items-start gap-2">
                <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  isRejected ? 'text-red-400' : 'text-amber-400'
                }`} />
                <div className="text-left">
                  <p className={`text-xs font-mono leading-relaxed ${isRejected ? 'text-red-300' : 'text-amber-300'}`}>
                    {isRejected
                      ? 'Your handler clearance has been revoked. Standard operative access remains. Contact your administrator.'
                      : 'Clearance authorization typically takes 1-2 business days. You retain standard operative access during review.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-xs text-zinc-500 font-mono">
              Applied on: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              }) : '—'}
            </div>
          </div>
        </GlassPanel>
      </div>
    </DashboardLayout>
  );
}
