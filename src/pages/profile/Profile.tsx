import { useState, useEffect } from 'react';
import { User, ShieldCheck, Copy, Check } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [birthDate, setBirthDate] = useState(() => user?.birth_date ?? user?.birth ?? '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [twoFaBusy, setTwoFaBusy] = useState(false);
  const [twoFaMessage, setTwoFaMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [setupPayload, setSetupPayload] = useState<{ secret: string; qr_code_svg: string } | null>(null);
  const [confirmCode, setConfirmCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackups, setCopiedBackups] = useState(false);

  const [disablePassword, setDisablePassword] = useState('');
  const [disableOtp, setDisableOtp] = useState('');
  const [disableBackup, setDisableBackup] = useState('');

  useEffect(() => {
    setBirthDate(user?.birth_date ?? user?.birth ?? '');
  }, [user?.birth_date, user?.birth]);

  const twoFactorEnabled = user?.two_factor_enabled === true;

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

  const startTwoFactorSetup = async () => {
    setTwoFaBusy(true);
    setTwoFaMessage(null);
    setBackupCodes(null);
    setConfirmCode('');
    try {
      const res = await api.post<{ data: { secret: string; qr_code_svg: string } }>('/auth/two-factor/setup');
      const d = res.data.data;
      setSetupPayload({ secret: d.secret, qr_code_svg: d.qr_code_svg });
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      setTwoFaMessage({ type: 'err', text: ax.response?.data?.message || 'Não foi possível iniciar a configuração.' });
    } finally {
      setTwoFaBusy(false);
    }
  };

  const cancelTwoFactorSetup = () => {
    setSetupPayload(null);
    setConfirmCode('');
    setTwoFaMessage(null);
  };

  const confirmTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = confirmCode.replace(/\D/g, '');
    if (digits.length !== 6) {
      setTwoFaMessage({ type: 'err', text: 'Informe o código de 6 dígitos.' });
      return;
    }
    setTwoFaBusy(true);
    setTwoFaMessage(null);
    try {
      const res = await api.post<{ data: { backup_codes: string[]; user: unknown } }>('/auth/two-factor/confirm', {
        code: digits,
      });
      const codes = res.data.data.backup_codes;
      setBackupCodes(Array.isArray(codes) ? codes : []);
      setSetupPayload(null);
      setConfirmCode('');
      await refreshUser();
      setTwoFaMessage({
        type: 'ok',
        text: 'Dois fatores ativado. Guarde os códigos de backup abaixo — eles não serão mostrados novamente.',
      });
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      setTwoFaMessage({ type: 'err', text: ax.response?.data?.message || 'Código inválido.' });
    } finally {
      setTwoFaBusy(false);
    }
  };

  const submitDisableTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disablePassword.trim() && !disableOtp.replace(/\D/g, '').slice(0, 6) && !disableBackup.trim()) {
      setTwoFaMessage({ type: 'err', text: 'Informe a senha, o código do app (6 dígitos) ou um código de backup.' });
      return;
    }
    setTwoFaBusy(true);
    setTwoFaMessage(null);
    try {
      await api.post('/auth/two-factor/disable', {
        password: disablePassword || undefined,
        code: disableOtp.replace(/\D/g, '').length === 6 ? disableOtp.replace(/\D/g, '') : undefined,
        backup_code: disableBackup.trim() || undefined,
      });
      setDisablePassword('');
      setDisableOtp('');
      setDisableBackup('');
      setBackupCodes(null);
      await refreshUser();
      setTwoFaMessage({ type: 'ok', text: 'Autenticação em dois passos desativada.' });
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      setTwoFaMessage({ type: 'err', text: ax.response?.data?.message || 'Não foi possível desativar.' });
    } finally {
      setTwoFaBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <User className="h-6 w-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Dados pessoais</h2>
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

      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Autenticação em dois passos</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Proteção opcional com app compatível com Google Authenticator (código a cada 30 segundos).
        </p>

        {twoFaMessage ? (
          <p
            className={`text-sm mb-4 ${twoFaMessage.type === 'ok' ? 'text-green-700' : 'text-red-600'}`}
            role="alert"
          >
            {twoFaMessage.text}
          </p>
        ) : null}

        {backupCodes && backupCodes.length > 0 ? (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-900 mb-2">Códigos de backup (guarde em local seguro)</p>
            <ul className="font-mono text-sm text-amber-950 space-y-1 mb-3">
              {backupCodes.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(backupCodes.join('\n'));
                setCopiedBackups(true);
                setTimeout(() => setCopiedBackups(false), 2000);
              }}
              className="inline-flex items-center gap-1 text-sm text-amber-900 font-medium hover:underline"
            >
              {copiedBackups ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedBackups ? 'Copiado' : 'Copiar todos'}
            </button>
            <button
              type="button"
              onClick={() => setBackupCodes(null)}
              className="mt-3 block text-sm text-gray-600 hover:text-gray-900"
            >
              Entendi, ocultar lista
            </button>
          </div>
        ) : null}

        {!twoFactorEnabled && !setupPayload && (
          <button
            type="button"
            disabled={twoFaBusy}
            onClick={() => void startTwoFactorSetup()}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {twoFaBusy ? 'Carregando…' : 'Ativar dois fatores'}
          </button>
        )}

        {setupPayload && (
          <form onSubmit={confirmTwoFactor} className="space-y-4 mt-4">
            <p className="text-sm text-gray-700">
              1. Escaneie o QR no app. 2. Ou digite a chave manualmente. 3. Informe o código de 6 dígitos para
              confirmar.
            </p>
            <div
              className="flex justify-center rounded-lg border border-gray-100 bg-white p-2 [&_svg]:max-w-[200px]"
              dangerouslySetInnerHTML={{ __html: setupPayload.qr_code_svg }}
            />
            <div>
              <p className="text-xs text-gray-500 mb-1">Chave manual</p>
              <div className="flex flex-wrap items-center gap-2">
                <code className="text-sm break-all rounded bg-gray-100 px-2 py-1">{setupPayload.secret}</code>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(setupPayload.secret);
                    setCopiedSecret(true);
                    setTimeout(() => setCopiedSecret(false), 2000);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-primary-600"
                >
                  {copiedSecret ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedSecret ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="totp_confirm" className="mb-1 block text-sm font-medium text-gray-700">
                Código do app (6 dígitos)
              </label>
              <input
                id="totp_confirm"
                inputMode="numeric"
                maxLength={6}
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm tracking-widest"
                placeholder="000000"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={twoFaBusy || confirmCode.replace(/\D/g, '').length !== 6}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                Confirmar ativação
              </button>
              <button
                type="button"
                onClick={cancelTwoFactorSetup}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {twoFactorEnabled && (
          <form onSubmit={submitDisableTwoFactor} className="mt-4 space-y-3 border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-600">Dois fatores está ativo. Para desativar, confirme com um dos métodos:</p>
            <div>
              <label htmlFor="disable_pw" className="mb-1 block text-sm font-medium text-gray-700">
                Senha da conta
              </label>
              <input
                id="disable_pw"
                type="password"
                autoComplete="current-password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="disable_otp" className="mb-1 block text-sm font-medium text-gray-700">
                Ou código do app (6 dígitos)
              </label>
              <input
                id="disable_otp"
                inputMode="numeric"
                maxLength={6}
                value={disableOtp}
                onChange={(e) => setDisableOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="disable_bak" className="mb-1 block text-sm font-medium text-gray-700">
                Ou código de backup
              </label>
              <input
                id="disable_bak"
                value={disableBackup}
                onChange={(e) => setDisableBackup(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="xxxx-xxxx"
              />
            </div>
            <button
              type="submit"
              disabled={twoFaBusy}
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-100 disabled:opacity-50"
            >
              Desativar dois fatores
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
