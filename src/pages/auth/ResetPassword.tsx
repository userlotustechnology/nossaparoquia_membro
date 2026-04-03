import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      setError('As senhas não conferem.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/reset-password', {
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(true);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || 'Erro ao redefinir a senha.');
      } else {
        setError('Erro ao redefinir a senha. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-900 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <img
              src="/logo.png"
              alt="Nossa Paróquia Online"
              className="mx-auto w-24 h-24 rounded-full object-cover mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900">Redefinir Senha</h1>
            <p className="text-sm text-gray-500 mt-1">Digite sua nova senha</p>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">Senha redefinida com sucesso!</p>
                <p className="text-sm text-green-700 mt-1">Você já pode fazer login com sua nova senha.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Nova senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoFocus
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors pr-10"
                    placeholder="Mínimo 8 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar nova senha
                </label>
                <input
                  id="password_confirmation"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                  placeholder="Repita a nova senha"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-medium rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? 'Redefinindo...' : 'Redefinir Senha'}
              </button>
            </form>
          )}

          <div className="mt-6">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
