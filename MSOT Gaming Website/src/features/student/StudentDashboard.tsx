import { GraduationCap, Swords, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { GlassPanel } from '../../components/ui/GlassPanel';
import { useAuth } from '../../hooks/useAuth';

export function StudentDashboard() {
  const { profile } = useAuth();

  return (
    <DashboardLayout
      title={profile?.full_name || 'STUDENT'}
      subtitle="Los Santos Campus HQ • Active Mission Briefing"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Profile dossier */}
        <GlassPanel className="p-6 border-zinc-800 bg-black/60" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-zinc-800 text-amber-400 border border-amber-500/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-chalet uppercase">DOSSIER</h3>
              <p className="text-[10px] font-mono text-zinc-500 uppercase">Clearance Level 1</p>
            </div>
          </div>
          <div className="space-y-2 text-xs font-mono text-zinc-400">
            <p><span className="text-zinc-500">Name:</span> <strong className="text-white">{profile?.full_name}</strong></p>
            <p><span className="text-zinc-500">Email:</span> {profile?.email}</p>
            <p><span className="text-zinc-500">Role:</span> <span className="uppercase text-amber-400 font-bold">{profile?.role}</span></p>
            <p>
              <span className="text-zinc-500">Enrolled:</span>{' '}
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800">
            <Link
              to="/student"
              className="text-[11px] font-mono text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider flex items-center justify-between transition-colors"
            >
              <span>OPEN FULL DOSSIER & LEDGER</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </GlassPanel>

        {/* Active Heist / Daily Mission */}
        <GlassPanel className="p-6 border-[#F7941D]/30 bg-gradient-to-b from-[#F7941D]/5 to-black/70" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#F7941D]/20 text-[#F7941D] border border-[#F7941D]/30">
                <Swords className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-chalet uppercase">Daily Heist</h3>
                <p className="text-[10px] font-mono text-amber-400 uppercase font-bold">Ammu-Nation Armory • +40 Respect</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] font-bold">
              ACTIVE
            </span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
            Target: <strong>Recursion Armory</strong>. Rapid-fire algorithm questions on Divide & Conquer and Backtracking. Complete to maintain your Wanted streak.
          </p>
          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <Link
              to="/quest/node-2"
              className="text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1 transition"
            >
              <span>LAUNCH MISSION</span>
              <span>&rarr;</span>
            </Link>
            <span className="text-zinc-500">Press [M] for Map</span>
          </div>
        </GlassPanel>

        {/* Wanted Level & Streak Multiplier */}
        <GlassPanel className="p-6 border-zinc-800 bg-black/60" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-zinc-800 text-red-400 border border-red-500/30">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-chalet uppercase">Wanted Streak</h3>
              <p className="text-[10px] font-mono text-zinc-500 uppercase">5-Star Meter Active</p>
            </div>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            Maintain your daily streak to elevate your Wanted Level to 5 stars. Reaching 5 stars unlocks the <strong>+50 XP Multiplier</strong> for weekly campus battles.
          </p>
          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono">
            <span className="text-zinc-500">Streak Shields:</span>
            <span className="text-cyan-400 font-bold">2 Freezes Ready</span>
          </div>
        </GlassPanel>
      </div>
    </DashboardLayout>
  );
}
