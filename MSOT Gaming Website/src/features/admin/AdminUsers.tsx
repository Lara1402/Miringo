import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Filter, RefreshCw, CheckCircle, XCircle,
  ChevronDown, Users, Clock, GraduationCap, BookOpen,
  AlertTriangle, Eye, ArrowUpDown, Shield, ShieldCheck,
  Sparkles, Check, ArrowRightLeft, Copy, ExternalLink, Code2, Database
} from 'lucide-react';
import toast from 'react-hot-toast';

import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { GlassPanel } from '../../components/ui/GlassPanel';
import { Button } from '../../components/ui/Button';
import { approvalService, SQL_RECURSION_FIX } from '../../services/approvalService';
import type { Profile, FilterStatus, SortOrder, UserRole, ApprovalStatus } from '../../types';

interface ConfirmActionState {
  userId: string;
  userName: string;
  userEmail: string;
  action: 'approve_student' | 'approve_faculty' | 'change_role' | 'reject';
  targetRole?: UserRole;
  targetStatus?: ApprovalStatus;
}

export function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRecursionError, setIsRecursionError] = useState(false);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [showSqlCode, setShowSqlCode] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [sort, setSort] = useState<SortOrder>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmActionState | null>(null);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await approvalService.getUsersWithStatus({ search, status: filter, sort });
      setUsers(result.users);
      setIsFallbackMode(result.isFallback);
      setIsRecursionError(result.isRecursionError);
      setError(result.error);
      if (!result.isFallback && !result.error) {
        // Successfully connected to live database
        setError(null);
      }
    } catch (err: any) {
      const message = err?.message || 'Failed to load registered members';
      setError(message);
      setIsRecursionError(message.toLowerCase().includes('infinite recursion'));
      setIsFallbackMode(true);
    } finally {
      setLoading(false);
    }
  }, [search, filter, sort]);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_RECURSION_FIX);
    setCopiedSql(true);
    toast.success('SQL fix script copied to clipboard!');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  useEffect(() => {
    const debounce = setTimeout(loadUsers, 300);
    return () => clearTimeout(debounce);
  }, [loadUsers]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = users.length;
    const pending = users.filter((u) => u.approval_status === 'pending').length;
    const faculty = users.filter((u) => u.role === 'faculty').length;
    const students = users.filter((u) => u.role === 'student' && u.approval_status === 'approved').length;
    return { total, pending, faculty, students };
  }, [users]);

  // Unified approval and role change execution
  const handleExecuteAction = async () => {
    if (!confirmAction) return;
    const { userId, action, targetRole, targetStatus } = confirmAction;

    setActionLoading(userId);
    try {
      if (action === 'approve_student') {
        await approvalService.updateMemberRoleAndStatus(userId, 'student', 'approved');
        toast.success('Approved registered member as Student!');
      } else if (action === 'approve_faculty') {
        await approvalService.updateMemberRoleAndStatus(userId, 'faculty', 'approved');
        toast.success('Approved registered member as Faculty with modification access!');
      } else if (action === 'change_role' && targetRole && targetStatus) {
        await approvalService.updateMemberRoleAndStatus(userId, targetRole, targetStatus);
        toast.success(
          targetRole === 'faculty'
            ? 'Marked as Faculty (granted modification access).'
            : 'Marked as Student.'
        );
      } else if (action === 'reject') {
        await approvalService.rejectMember(userId);
        toast.success('Registration has been rejected.');
      }
      setConfirmAction(null);
      await loadUsers();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update member status');
    } finally {
      setActionLoading(null);
    }
  };

  const filterOptions: { value: FilterStatus; label: string; count?: number; icon: React.ReactNode }[] = [
    { value: 'all', label: 'All Members', icon: <Users className="w-3.5 h-3.5" /> },
    { value: 'pending', label: 'Pending Approval', count: stats.pending, icon: <Clock className="w-3.5 h-3.5" /> },
    { value: 'student', label: 'Students', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { value: 'faculty', label: 'Faculty (Mod Access)', count: stats.faculty, icon: <BookOpen className="w-3.5 h-3.5" /> },
    { value: 'approved', label: 'Approved', icon: <CheckCircle className="w-3.5 h-3.5" /> },
    { value: 'rejected', label: 'Rejected', icon: <XCircle className="w-3.5 h-3.5" /> },
  ];

  return (
    <DashboardLayout
      title="COMMAND CENTER"
      subtitle="Operative Clearance Management • Role Assignment Protocol"
    >
      {/* Platform Role Overview Banner */}
      <GlassPanel className="p-4 mb-6 border-cyan-500/20 bg-gradient-to-r from-cyan-950/20 via-slate-900/40 to-violet-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 mt-0.5">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                MSOT Access & Modification Permissions
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                <span className="text-violet-300 font-medium">Faculty members</span> have modification access to create quizzes, update syllabi, verify test scores, and configure learning content.
                <span className="text-cyan-300 font-medium ml-1">Students</span> participate in daily quests, micro-challenges, streaks, and leagues.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 text-xs">
            {isFallbackMode ? (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1.5 font-medium">
                <Database className="w-3 h-3 text-amber-400" /> Preview Mode · SQL Setup Required
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1.5 font-medium">
                <Check className="w-3 h-3" /> Database Sync Active
              </span>
            )}
          </div>
        </div>
      </GlassPanel>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GlassPanel className="p-4" glow={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">Total Members</p>
              <p className="text-3xl font-pricedown text-white mt-1">{stats.total}</p>
            </div>
            <div className="p-2.5 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className={`p-4 ${stats.pending > 0 ? 'border-amber-500/40 bg-amber-500/[0.03]' : ''}`} glow={stats.pending > 0}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">Pending Approval</p>
              <p className="text-3xl font-pricedown text-white mt-1">{stats.pending}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-4" glow={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">Faculty (Modifiers)</p>
              <p className="text-3xl font-pricedown text-white mt-1">{stats.faculty}</p>
            </div>
            <div className="p-2.5 bg-zinc-800 text-violet-400 border border-violet-500/30 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-4" glow={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">Approved Students</p>
              <p className="text-3xl font-pricedown text-white mt-1">{stats.students}</p>
            </div>
            <div className="p-2.5 bg-zinc-800 text-cyan-400 border border-cyan-500/30 rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Search & Filters */}
      <GlassPanel className="p-4 mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search operatives by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-slate-600 text-sm focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              icon={<Filter className="w-3.5 h-3.5" />}
            >
              Filter
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSort(sort === 'newest' ? 'oldest' : 'newest')}
              icon={<ArrowUpDown className="w-3.5 h-3.5" />}
            >
              {sort === 'newest' ? 'Newest' : 'Oldest'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={loadUsers}
              loading={loading}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter pills */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/5">
                {filterOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFilter(opt.value)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer
                      ${filter === opt.value
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-white/[0.03] text-slate-400 border border-white/5 hover:border-white/10'
                      }`}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                    {typeof opt.count === 'number' && opt.count > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[10px]">
                        {opt.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassPanel>

      {/* RLS Policy Infinite Recursion Alert / 1-Click Fix */}
      {isRecursionError && !bannerDismissed && (
        <GlassPanel className="relative p-5 mb-6 border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-red-950/20" glow={true}>
          <button
            onClick={() => setBannerDismissed(true)}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Dismiss notice"
            aria-label="Dismiss notice"
          >
            <XCircle className="w-4 h-4" />
          </button>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 pr-8">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 mt-0.5 flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">
                    Supabase RLS Policy Infinite Recursion Detected
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-red-500/20 text-red-300 border border-red-500/30">
                    ERROR 42P17
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  An older row-level security policy on table <code className="font-mono text-amber-300 bg-black/40 px-1 py-0.5 rounded">public.profiles</code> in your Supabase project contains a circular query referencing itself. We have automatically activated offline preview mode so you can view member profiles and test role approvals right now.
                </p>
                <p className="text-xs text-amber-300/90 mt-1">
                  To connect your real live Supabase database, copy the fix script below and run it in the Supabase SQL Editor (takes ~10 seconds).
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
              <Button
                variant="primary"
                size="sm"
                onClick={handleCopySql}
                icon={copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copiedSql ? 'SQL Copied!' : 'Copy SQL Fix Script'}
              </Button>

              <a
                href="https://supabase.com/dashboard/project/rjwjanjpctypununlzbv/sql/new"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  Open Supabase SQL Editor
                </Button>
              </a>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSqlCode(!showSqlCode)}
                icon={<Code2 className="w-3.5 h-3.5" />}
              >
                {showSqlCode ? 'Hide SQL Code' : 'View SQL Code'}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={loadUsers}
                loading={loading}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Test & Sync Database
              </Button>
            </div>

            <AnimatePresence>
              {showSqlCode && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="relative mt-2 p-3 rounded-xl bg-black/70 border border-white/10 font-mono text-[11px] text-slate-300 max-h-56 overflow-y-auto">
                    <button
                      onClick={handleCopySql}
                      className="absolute top-2 right-2 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                    >
                      {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedSql ? 'Copied' : 'Copy'}
                    </button>
                    <pre className="pr-16 whitespace-pre-wrap">{SQL_RECURSION_FIX}</pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </GlassPanel>
      )}

      {/* Generic error state if not recursion */}
      {error && !isRecursionError && (
        <GlassPanel className="p-6 mb-6" glow={false}>
          <div className="flex items-center gap-3 text-red-400">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Failed to load members from database</p>
              <p className="text-sm text-red-400/70 mt-1">{error}</p>
              {error.includes('relation "public.profiles" does not exist') && (
                <div className="text-xs text-amber-300 mt-2 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                  <strong>Database Setup Needed:</strong> The database table does not exist yet. Please run the SQL script from <code className="font-mono bg-black/40 px-1 py-0.5 rounded">supabase/schema.sql</code> in your Supabase SQL Editor.
                </div>
              )}
            </div>
            <Button variant="secondary" size="sm" onClick={loadUsers}>
              Retry
            </Button>
          </div>
        </GlassPanel>
      )}

      {/* Loading skeleton */}
      {loading && !users.length && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 animate-shimmer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5" />
                <div className="flex-1 space-y-2">
                  <div className="w-32 h-4 rounded bg-white/5" />
                  <div className="w-48 h-3 rounded bg-white/5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && users.length === 0 && !error && (
        <GlassPanel className="p-12 text-center" glow={false}>
          <Users className="w-10 h-10 mx-auto mb-3 opacity-50 text-slate-500" />
          <p className="font-medium text-slate-300">No registered members found</p>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your search query or active filter.</p>
        </GlassPanel>
      )}

      {/* Members List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {users.map((user, index) => {
            const isPending = user.approval_status === 'pending';
            const isFaculty = user.role === 'faculty';
            const isAdmin = user.role === 'admin';

            return (
              <motion.div
                key={user.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.02 }}
              >
                <GlassPanel
                  className={`p-4 transition-colors ${isPending ? 'border-amber-500/30 bg-amber-500/[0.02]' : ''}`}
                  glow={false}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* User Profile Info */}
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-semibold text-sm flex-shrink-0 ${
                        isAdmin
                          ? 'bg-gradient-to-br from-violet-500/30 to-purple-500/30 text-violet-200 border border-violet-500/40'
                          : isFaculty
                          ? 'bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-violet-300 border border-violet-500/30'
                          : 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-bold font-chalet uppercase truncate text-base">{user.full_name}</p>
                          {isAdmin && (
                            <span className="px-1.5 py-0.5 text-[10px] rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                      </div>
                    </div>

                    {/* Role & Status Badges */}
                    <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                      {/* Role Badge */}
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30 font-medium">
                          <Sparkles className="w-3 h-3 text-purple-400" /> System Admin
                        </span>
                      ) : isFaculty ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-violet-500/15 text-violet-200 border border-violet-500/30 font-medium shadow-sm shadow-violet-500/10">
                          <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                          Faculty · Modification Access
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-medium">
                          <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                          Student · Learner
                        </span>
                      )}

                      {/* Approval Status Badge */}
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium animate-pulse">
                          <Clock className="w-3 h-3 text-amber-400" /> Pending Approval
                        </span>
                      )}
                      {user.approval_status === 'approved' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                          <CheckCircle className="w-3 h-3 text-emerald-400" /> Registered & Approved
                        </span>
                      )}
                      {user.approval_status === 'rejected' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-red-500/10 text-red-300 border border-red-500/20 font-medium">
                          <XCircle className="w-3 h-3 text-red-400" /> Rejected
                        </span>
                      )}
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                        icon={<Eye className="w-3.5 h-3.5" />}
                      >
                        Details
                      </Button>

                      {/* If user is not admin, provide full approval and role modification options */}
                      {!isAdmin && (
                        <>
                          {isPending ? (
                            /* Options for pending users */
                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() =>
                                  setConfirmAction({
                                    userId: user.id,
                                    userName: user.full_name,
                                    userEmail: user.email,
                                    action: 'approve_student',
                                    targetRole: 'student',
                                    targetStatus: 'approved',
                                  })
                                }
                                loading={actionLoading === user.id}
                                icon={<GraduationCap className="w-3.5 h-3.5" />}
                              >
                                Approve as Student
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10"
                                onClick={() =>
                                  setConfirmAction({
                                    userId: user.id,
                                    userName: user.full_name,
                                    userEmail: user.email,
                                    action: 'approve_faculty',
                                    targetRole: 'faculty',
                                    targetStatus: 'approved',
                                  })
                                }
                                loading={actionLoading === user.id}
                                icon={<BookOpen className="w-3.5 h-3.5" />}
                              >
                                Approve as Faculty
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() =>
                                  setConfirmAction({
                                    userId: user.id,
                                    userName: user.full_name,
                                    userEmail: user.email,
                                    action: 'reject',
                                  })
                                }
                                loading={actionLoading === user.id}
                                icon={<XCircle className="w-3.5 h-3.5" />}
                              >
                                Reject
                              </Button>
                            </div>
                          ) : (
                            /* Options for already approved members: Role switching / revocation */
                            <div className="flex items-center gap-1.5">
                              {isFaculty ? (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/10"
                                  onClick={() =>
                                    setConfirmAction({
                                      userId: user.id,
                                      userName: user.full_name,
                                      userEmail: user.email,
                                      action: 'change_role',
                                      targetRole: 'student',
                                      targetStatus: 'approved',
                                    })
                                  }
                                  loading={actionLoading === user.id}
                                  icon={<ArrowRightLeft className="w-3.5 h-3.5" />}
                                >
                                  Mark as Student
                                </Button>
                              ) : (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="text-violet-300 border-violet-500/30 hover:bg-violet-500/10"
                                  onClick={() =>
                                    setConfirmAction({
                                      userId: user.id,
                                      userName: user.full_name,
                                      userEmail: user.email,
                                      action: 'change_role',
                                      targetRole: 'faculty',
                                      targetStatus: 'approved',
                                    })
                                  }
                                  loading={actionLoading === user.id}
                                  icon={<ShieldCheck className="w-3.5 h-3.5" />}
                                >
                                  Mark as Faculty
                                </Button>
                              )}

                              {user.approval_status !== 'rejected' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                  onClick={() =>
                                    setConfirmAction({
                                      userId: user.id,
                                      userName: user.full_name,
                                      userEmail: user.email,
                                      action: 'reject',
                                    })
                                  }
                                  loading={actionLoading === user.id}
                                >
                                  Revoke
                                </Button>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Expanded Member Details */}
                  <AnimatePresence>
                    {selectedUser?.id === user.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-slate-500 text-xs font-medium">User Identifier (UUID)</span>
                            <p className="text-slate-300 font-mono text-xs mt-0.5 truncate">{user.id}</p>
                          </div>
                          <div>
                            <span className="text-slate-500 text-xs font-medium">Current Role</span>
                            <p className="text-white capitalize mt-0.5 font-semibold flex items-center gap-1.5">
                              {user.role === 'faculty' ? (
                                <span className="text-violet-300">Faculty (Modifier)</span>
                              ) : user.role === 'admin' ? (
                                <span className="text-purple-300">Administrator</span>
                              ) : (
                                <span className="text-cyan-300">Student (Learner)</span>
                              )}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-500 text-xs font-medium">Platform Access Permissions</span>
                            <p className="text-xs text-slate-300 mt-0.5">
                              {user.role === 'faculty'
                                ? 'Full modification access to quizzes, syllabus, and XP'
                                : user.role === 'admin'
                                ? 'Full system control & user approvals'
                                : 'Play, practice, streaks, quests, and leagues'}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-500 text-xs font-medium">Registration Date</span>
                            <p className="text-slate-300 text-xs mt-0.5">
                              {new Date(user.created_at).toLocaleString()}
                            </p>
                          </div>
                          {user.approved_at && (
                            <div>
                              <span className="text-slate-500 text-xs font-medium">Approval Timestamp</span>
                              <p className="text-slate-300 text-xs mt-0.5">
                                {new Date(user.approved_at).toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassPanel>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmAction(null)}
          >
            <motion.div
              className="relative w-full max-w-md"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <GlassPanel className="p-6">
                <div className="text-center space-y-4">
                  {confirmAction.action === 'approve_faculty' || confirmAction.targetRole === 'faculty' ? (
                    <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto text-violet-400">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                  ) : confirmAction.action === 'reject' ? (
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto text-red-400">
                      <XCircle className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto text-amber-400">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {confirmAction.action === 'approve_student' && 'Approve Member as Student'}
                      {confirmAction.action === 'approve_faculty' && 'Approve Member as Faculty'}
                      {confirmAction.action === 'change_role' &&
                        (confirmAction.targetRole === 'faculty'
                          ? 'Mark Member as Faculty'
                          : 'Mark Member as Student')}
                      {confirmAction.action === 'reject' && 'Reject Member Registration'}
                    </h3>
                    <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                      Are you sure you want to proceed for member{' '}
                      <strong className="text-white">{confirmAction.userName}</strong> ({confirmAction.userEmail})?
                    </p>

                    {(confirmAction.action === 'approve_faculty' || confirmAction.targetRole === 'faculty') && (
                      <div className="mt-3 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20 text-left text-xs text-violet-300">
                        <p className="font-semibold flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5" /> Modification Access Notice:
                        </p>
                        <p className="mt-1 text-slate-400">
                          Marking this user as <strong>Faculty</strong> grants them editing permissions to create daily micro-challenges, approve question banks, adjust course syllabi, and override XP spikes.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 justify-center pt-2">
                    <Button variant="secondary" onClick={() => setConfirmAction(null)}>
                      Cancel
                    </Button>
                    <Button
                      variant={
                        confirmAction.action === 'reject'
                          ? 'danger'
                          : confirmAction.action === 'approve_faculty' || confirmAction.targetRole === 'faculty'
                          ? 'primary'
                          : 'primary'
                      }
                      loading={actionLoading === confirmAction.userId}
                      onClick={handleExecuteAction}
                    >
                      Confirm & Save to Database
                    </Button>
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
