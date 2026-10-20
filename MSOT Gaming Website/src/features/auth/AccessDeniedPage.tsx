import { motion } from 'motion/react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { GlassPanel } from '../../components/ui/GlassPanel';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { getRedirectPath } from '../../utils/routes';

export function AccessDeniedPage() {
  const { profile } = useAuth();
  const returnPath = profile ? getRedirectPath(profile.role, profile.approval_status) : '/login';

  return (
    <AuthLayout title="RESTRICTED ZONE" subtitle="Clearance level insufficient">
      <GlassPanel className="p-8 text-center" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.4 }}
          className="w-16 h-16 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center mx-auto mb-4"
        >
          <ShieldAlert className="w-8 h-8 text-red-400" />
        </motion.div>

        <h2 className="text-xl font-chalet font-black uppercase tracking-wider text-red-400 gta-text-shadow mb-2">ACCESS DENIED</h2>
        <p className="text-sm text-slate-400 mb-6">
          Your operative clearance level does not authorize access to this zone. Contact your handler (administrator) if this is an error.
        </p>

        <Link to={returnPath}>
          <Button variant="secondary" className="w-full" icon={<ArrowLeft className="w-4 h-4" />}>
            RETURN TO HQ
          </Button>
        </Link>
      </GlassPanel>
    </AuthLayout>
  );
}
