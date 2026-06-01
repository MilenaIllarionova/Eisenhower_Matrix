import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import OAuthRow from '../components/auth/OAuthRow';
import { useAuthStore } from '../store/useAuthStore';
import { LockIcon, MailIcon, UserIcon } from '../components/common/Icons';
import { t } from '../i18n/ru';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/boards');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? t.auth.loginFailed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex-1 flex items-center justify-center px-16">
        <div className="w-full max-w-lg">
          <div className="flex items-center gap-6 mb-16">
            <div className="w-30 h-30 rounded-full bg-accent flex items-center justify-center text-bg">
              <UserIcon className="w-24 h-24" />
            </div>
            <h2 className="text-3xl font-bold tracking-wide text-white">{t.auth.loginUpper}</h2>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-10">
            <label className="flex items-center gap-3">
              <MailIcon className="w-8 h-8 text-white/50" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.auth.email} className="input-line" autoComplete="email" />
            </label>
            <label className="flex items-center gap-3">
              <LockIcon className="w-8 h-8 text-white/50" />
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.auth.password} className="input-line" autoComplete="current-password" />
            </label>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex items-center justify-between mt-2">
              <button type="button" className="text-xs text-white/60 hover:text-white" onClick={() => alert('Восстановление пароля — направление развития')}>
                {t.auth.forgot}
              </button>
              <button type="submit" className="btn-accent" disabled={submitting}>
                {submitting ? '...' : t.auth.submitLogin}
              </button>
            </div>
            <p className="text-xs text-white/40 mt-2">
              {t.auth.noAccount}{' '}
              <Link to="/signup" className="text-accent hover:underline">{t.auth.signup}</Link>
            </p>
          </form>
        </div>
      </div>

      <div className="px-16 pb-8">
        <OAuthRow />
      </div>
    </AuthLayout>
  );
}