import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertTriangle, KeyRound, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

import { AuthLayout } from '../../components/layout/AuthLayout';
import { GlassPanel } from '../../components/ui/GlassPanel';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/authService';
import { forgotPasswordSchema, type ForgotPasswordInput } from '../../utils/validation';

export function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setErrorMessage(null);
    setSubmittedEmail(data.email);
    try {
      await authService.resetPasswordForEmail(data.email);
      setSubmitted(true);
      toast.success('Authorization token dispatched. Check your inbox.');
    } catch (error: any) {
      const msg = error?.message || 'Failed to dispatch reset email.';
      setErrorMessage(msg);
      toast.error(msg);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <AuthLayout title="AUTHORIZATION SENT" subtitle="Check your communications terminal">
        <GlassPanel className="p-8" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="text-center space-y-4">
            {errorMessage ? (
              <div className="p-3 bg-red-950/70 border border-red-500/50 rounded-xl text-left font-mono text-xs text-red-200 flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-red-300 block uppercase">FIB Relay Warning:</span>
                  <span className="text-zinc-200">{errorMessage}</span>
                  <p className="mt-1 text-[10px] text-zinc-400">
                    If campus email relay is rate-limited (free Supabase tier limits to ~3-4 emails/hr), please wait a minute or proceed with your access code below.
                  </p>
                </div>
              </div>
            ) : (
              <CheckCircle className="w-12 h-12 text-amber-400 mx-auto" />
            )}

            <p className="text-slate-300 text-sm font-sans">
              If an operative account exists for <strong className="text-amber-400 font-mono">{submittedEmail}</strong>,
              password reset instructions and a cryptographic link were dispatched. Please check your inbox and spam folder.
            </p>

            <div className="pt-2 border-t border-zinc-800 space-y-2">
              <Link
                to={`/reset-password?email=${encodeURIComponent(submittedEmail)}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs uppercase font-bold tracking-wider transition"
              >
                <KeyRound className="w-4 h-4" />
                Proceed to Set New Access Code
              </Link>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white py-1.5 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Re-enter Email Address
              </button>
            </div>

            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors font-mono text-xs uppercase"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Access Terminal
              </Link>
            </div>
          </div>
        </GlassPanel>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="CREDENTIAL RECOVERY" subtitle="Submit your email to receive a reset authorization code">
      <GlassPanel
        className="p-6 sm:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
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

          <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
            REQUEST AUTHORIZATION CODE
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors font-mono text-xs uppercase"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Access Terminal
          </Link>
        </div>
      </GlassPanel>
    </AuthLayout>
  );
}
