import { Award, BookOpen, Users } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { GlassPanel } from '../../components/ui/GlassPanel';
import { useAuth } from '../../hooks/useAuth';

export function FacultyDashboard() {
  const { profile } = useAuth();

  return (
    <DashboardLayout
      title={`HANDLER: ${profile?.full_name || 'PROFESSOR'}`}
      subtitle="Faculty Command Terminal • Modification Access Granted"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GlassPanel className="p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-zinc-800 border border-emerald-500/30">
              <Award className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-chalet font-black text-white uppercase tracking-tight">HANDLER DOSSIER</h3>
          </div>
          <div className="space-y-2 text-xs text-zinc-400 font-mono leading-relaxed">
            <p><span className="text-zinc-500">Name:</span> <strong className="text-white">{profile?.full_name}</strong></p>
            <p><span className="text-zinc-500">Email:</span> {profile?.email}</p>
            <p>
              <span className="text-zinc-500">Status:</span>{' '}
              <span className="text-emerald-400 font-mono font-bold uppercase">Approved Faculty</span>
            </p>
            <p>
              <span className="text-zinc-500">Approved:</span>{' '}
              {profile?.approved_at
                ? new Date(profile.approved_at).toLocaleDateString()
                : '—'}
            </p>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-zinc-800 border border-violet-500/30">
              <BookOpen className="w-5 h-5 text-violet-400" />
            </div>
            <h3 className="text-lg font-chalet font-black text-white uppercase tracking-tight">MODIFICATION ARSENAL</h3>
          </div>
          <p className="text-xs text-zinc-400 font-mono leading-relaxed">
            Access your faculty tools and resources. Create content, manage courses,
            and engage with your students.
          </p>
        </GlassPanel>

        <GlassPanel className="p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-zinc-800 border border-cyan-500/30">
              <Users className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-lg font-chalet font-black text-white uppercase tracking-tight">CREW NETWORK</h3>
          </div>
          <p className="text-xs text-zinc-400 font-mono leading-relaxed">
            Connect with other faculty members and collaborate on educational
            initiatives across the MSOT platform.
          </p>
        </GlassPanel>
      </div>
    </DashboardLayout>
  );
}
