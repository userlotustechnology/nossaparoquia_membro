import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import api from '@/lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email, origin: window.location.origin });
      setSuccess(true);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as {
          response?: { data?: { message?: string } };
        };
        setError(
          axiosErr.response?.data?.message ||
            'Erro ao enviar e-mail de recuperacao.',
        );
      } else {
        setError('Erro ao enviar e-mail de recuperacao. Tente novamente.');
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
              Recuperar senha
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Informe seu e-mail para receber um link de recuperacao
            </p>
          </div>

          {/* Success */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  E-mail enviado com sucesso!
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Verifique sua caixa de entrada e siga as instrucoes para
                  redefinir sua senha.
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          {!success && (
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-medium rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Enviar link de recuperacao'}
              </button>
            </form>
          )}

          {/* Back to login */}
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
