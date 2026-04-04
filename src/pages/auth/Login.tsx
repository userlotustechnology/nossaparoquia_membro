import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';

type LoginStep = 'credentials' | '2fa';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<LoginStep>('credentials');
  const [twoFactorToken, setTwoFactorToken] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const { login, loginWithGoogle, completeTwoFactorLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.status === 'needs_2fa') {
        setTwoFactorToken(result.twoFactorToken);
        setStep('2fa');
        setOtpCode('');
        setBackupCode('');
        return;
      }
      navigate('/', { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(
          axiosErr.response?.data?.message ||
            'Erro ao fazer login. Verifique suas credenciais.',
        );
      } else {
        setError('Erro ao fazer login. Verifique suas credenciais.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!twoFactorToken) return;
    const code = otpCode.replace(/\D/g, '');
    const backup = backupCode.trim();
    if (code.length !== 6 && !backup) {
      setError('Informe o código de 6 dígitos do app ou um código de backup.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await completeTwoFactorLogin({
        twoFactorToken,
        code: code.length === 6 ? code : undefined,
        backupCode: backup || undefined,
      });
      navigate('/', { replace: true });
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || 'Código inválido. Tente novamente.');
      } else {
        setError('Código inválido. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: {
    credential?: string;
  }) => {
    if (!credentialResponse.credential) {
      setError('Erro ao autenticar com o Google.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await loginWithGoogle(credentialResponse.credential);
      if (result.status === 'needs_2fa') {
        setTwoFactorToken(result.twoFactorToken);
        setStep('2fa');
        setOtpCode('');
        setBackupCode('');
        return;
      }
      navigate('/', { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao autenticar com o Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-900 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <img
              src="/logo.png"
              alt="Nossa Paróquia Online"
              className="mx-auto w-24 h-24 rounded-full object-cover mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900">
              Nossa Paróquia Online
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Entre para acessar sua conta
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {step === '2fa' ? (
            <form onSubmit={handleTwoFactorSubmit} className="space-y-5">
              <div className="flex items-center gap-2 text-primary-700 mb-2">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-sm font-medium">Dois fatores</span>
              </div>
              <p className="text-sm text-gray-600">
                Abra o Google Authenticator (ou app equivalente) e digite o código de 6 dígitos, ou use um código de
                backup.
              </p>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  Código do app
                </label>
                <input
                  id="otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors tracking-widest text-center text-lg"
                  placeholder="000000"
                />
              </div>
              <div>
                <label htmlFor="backup" className="block text-sm font-medium text-gray-700 mb-1">
                  Código de backup (opcional)
                </label>
                <input
                  id="backup"
                  type="text"
                  autoComplete="off"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                  placeholder="xxxx-xxxx"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-medium rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? 'Verificando...' : 'Confirmar'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('credentials');
                  setTwoFactorToken(null);
                  setOtpCode('');
                  setBackupCode('');
                  setError('');
                }}
                className="w-full py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Voltar
              </button>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Senha
                    </label>
                    <Link
                      to="/esqueci-senha"
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors pr-10"
                      placeholder="********"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-medium rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>

              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">ou</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Erro ao autenticar com o Google.')}
                  text="signin_with"
                  shape="rectangular"
                  width={350}
                />
              </div>
            </>
          )}

          {/* Register link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Não tem conta?{' '}
            <Link
              to="/cadastro"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
