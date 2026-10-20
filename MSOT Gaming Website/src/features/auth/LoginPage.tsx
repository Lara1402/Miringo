import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

import { AuthLayout } from '../../components/layout/AuthLayout';
import { GlassPanel } from '../../components/ui/GlassPanel';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/authService';
import { profileService } from '../../services/profileService';
import { loginSchema, type LoginInput } from '../../utils/validation';
import { useAuth } from '../../hooks/useAuth';
import { getRedirectPath } from '../../utils/routes';

export function LoginPage() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const { user } = await authService.signIn(data);
      if (!user) {
        toast.error('Sign in failed. Please try again.');
        return;
      }
      toast.success('Access Granted. Welcome back, operative.');

      // Immediate redirect resolution on submit
      const isAdmin = user.email?.toLowerCase() === 'sudhanshu91730@gmail.com';
      let dest = isAdmin ? '/admin/users' : '/dashboard';

      try {
        const userProfile = await profileService.getProfile(user.id);
        if (userProfile) {
          dest = getRedirectPath(
            isAdmin ? 'admin' : userProfile.role,
            userProfile.approval_status
          );
        }
      } catch {
        // Fallback to computed destination
      }

      navigate(dest, { replace: true });
    } catch (error: any) {
      const message = error?.message || 'Sign in failed';
      if (message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password. Please try again.');
      } else if (message.includes('Email not confirmed')) {
        toast.error('Please verify your email before signing in.');
      } else {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="ACCESS TERMINAL" subtitle="Enter credentials to access Los Santos Campus Network">
      <GlassPanel
        className="p-6 sm:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Active Session Notification */}
        {profile && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <p className="text-slate-400">Currently logged in as:</p>
                <p className="text-white font-semibold truncate text-sm mt-0.5">
                  {profile.full_name}
                </p>
                <p className="text-amber-300 truncate">{profile.email}</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] uppercase font-bold tracking-wider">
                {profile.role}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-amber-500/15">
              <Button
                type="button"
                size="sm"
                className="flex-1"
                onClick={() => navigate(getRedirectPath(profile.role, profile.approval_status))}
              >
                Enter {profile.role === 'admin' ? 'Command Center' : 'Campus HQ'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={signOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            icon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            autoComplete="email"
            {...register('email')}
          />

          <Input
            label="Password"
            isPassword
            placeholder="Enter your password"
            icon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            autoComplete="current-password"
            {...register('password')}
          />

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            loading={isLoading}
            className="w-full"
            size="lg"
            icon={<LogIn className="w-4 h-4" />}
          >
            ACCESS CAMPUS
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-amber-400 hover:text-amber-300 transition-colors font-medium"
            >
              Create one
            </Link>
          </p>
        </div>
      </GlassPanel>
    </AuthLayout>
  );
}
