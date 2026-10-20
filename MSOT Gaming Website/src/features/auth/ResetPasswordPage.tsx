import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { AuthLayout } from '../../components/layout/AuthLayout';
import { GlassPanel } from '../../components/ui/GlassPanel';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/authService';
import { resetPasswordSchema, type ResetPasswordInput } from '../../utils/validation';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    try {
      await authService.updatePassword(data.password);
      setSuccess(true);
      toast.success('Access credentials updated. Report to terminal.');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update password. Please try again.');
    }
  };

  if (success) {
    return (
      <AuthLayout title="CREDENTIALS UPDATED" subtitle="Your access code has been changed">
        <GlassPanel className="p-8" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-amber-400 mx-auto" />
            <p className="text-slate-400 text-sm">
              Access credentials updated. Proceed to the Access Terminal to re-authenticate.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              PROCEED TO ACCESS TERMINAL
            </Button>
          </div>
        </GlassPanel>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="RESET CREDENTIALS" subtitle="Set a new access code for your operative profile">
      <GlassPanel
        className="p-6 sm:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="New Password"
            isPassword
            placeholder="Create a strong password"
            icon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            autoComplete="new-password"
            {...register('password')}
          />

          <Input
            label="Confirm New Password"
            isPassword
            placeholder="Confirm your new password"
            icon={<Lock className="w-4 h-4" />}
            error={errors.confirmPassword?.message}
            autoComplete="new-password"
            {...register('confirmPassword')}
          />

          <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
            SET NEW ACCESS CODE
          </Button>
        </form>
      </GlassPanel>
    </AuthLayout>
  );
}
