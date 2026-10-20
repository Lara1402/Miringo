import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { AuthLayout } from '../../components/layout/AuthLayout';
import { GlassPanel } from '../../components/ui/GlassPanel';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/authService';
import { registerSchema, type RegisterInput } from '../../utils/validation';

export function RegisterPage() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      accountType: 'student',
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      await authService.signUp({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        accountType: 'student',
      });
      setSuccess(true);
      toast.success('Operative registered. Verify your email to activate.');
    } catch (error: any) {
      const message = error?.message || 'Registration failed. Please try again.';
      if (message.includes('already registered') || message.includes('already been registered')) {
        toast.error('An account with this email already exists. Please sign in.');
      } else if (message.includes('weak_password') || message.includes('too weak')) {
        toast.error('Password is too weak. Please choose a stronger password.');
      } else {
        toast.error(message);
      }
    }
  };

  if (success) {
    return (
      <AuthLayout title="OPERATIVE REGISTERED" subtitle="Verify your email to activate campus access clearance.">
        <GlassPanel className="p-8" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
            >
              <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto" />
            </motion.div>
            <h2 className="text-xl font-semibold text-white">OPERATIVE REGISTERED</h2>
            <div className="space-y-3 text-sm text-slate-400">
              <p>Verify your email to activate campus access clearance.</p>
            </div>
            <Button
              onClick={() => navigate('/login')}
              className="w-full mt-4"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              PROCEED TO ACCESS TERMINAL
            </Button>
          </div>
        </GlassPanel>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="CREATE OPERATIVE" subtitle="New recruit onboarding protocol">
      <GlassPanel
        className="p-6 sm:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            icon={<User className="w-4 h-4" />}
            error={errors.fullName?.message}
            autoComplete="name"
            {...register('fullName')}
          />

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
            placeholder="Create a strong password"
            icon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            autoComplete="new-password"
            {...register('password')}
          />

          <Input
            label="Confirm Password"
            isPassword
            placeholder="Confirm your password"
            icon={<Lock className="w-4 h-4" />}
            error={errors.confirmPassword?.message}
            autoComplete="new-password"
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            loading={isSubmitting}
            className="w-full"
            size="lg"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            REGISTER OPERATIVE
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-amber-400 hover:text-amber-300 transition-colors font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </GlassPanel>
    </AuthLayout>
  );
}
