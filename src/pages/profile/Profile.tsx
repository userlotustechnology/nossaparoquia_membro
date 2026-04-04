import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [birthDate, setBirthDate] = useState(() => user?.birth_date ?? user?.birth ?? '');

  useEffect(() => {
    setBirthDate(user?.birth_date ?? user?.birth ?? '');
  }, [user?.birth_date, user?.birth]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await api.put('/profile', {
        birth_date: birthDate || null,
      });
      await refreshUser();
      setMessage({ type: 'ok', text: 'Perfil atualizado.' });
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const msg = ax.response?.data?.errors
        ? Object.values(ax.response.data.errors).flat().join(' ')
        : ax.response?.data?.message || 'Não foi possível salvar.';
      setMessage({ type: 'err', text: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <User className="h-6 w-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">
        <p className="text-sm text-gray-600 mb-4">
          A data de nascimento é usada para validar requisitos de idade em cursos e formações.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="birth_date" className="mb-1 block text-sm font-medium text-gray-700">
              Data de nascimento
            </label>
            <input
              id="birth_date"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          {message ? (
            <p
              className={`text-sm ${message.type === 'ok' ? 'text-green-700' : 'text-red-600'}`}
              role="alert"
            >
              {message.text}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </form>
      </div>
    </div>
  );
}
