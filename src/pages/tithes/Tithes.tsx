import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Wallet, Loader2, CreditCard, History, Bell, BellOff, Church } from 'lucide-react';

export default function Tithes() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [contributions, setContributions] = useState<any[]>([]);
  const [loadingContributions, setLoadingContributions] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [suggestedAmount, setSuggestedAmount] = useState('');
  const [preferredDay, setPreferredDay] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);

  const [digitalCard, setDigitalCard] = useState<any>(null);
  const [loadingCard, setLoadingCard] = useState(false);
  const [showCard, setShowCard] = useState(false);

  const [togglingReminder, setTogglingReminder] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get('/tithe-contributions/summary')
      .then((response) => {
        if (cancelled) return;
        setSummary(response.data);
      })
      .catch(() => { if (!cancelled) setSummary(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    api.get('/tithe-contributions?per_page=12&page=1')
      .then((response) => {
        if (cancelled) return;
        const data = Array.isArray(response.data.data) ? response.data.data : [];
        setContributions(data);
        setHasMore(data.length === 12);
      })
      .catch(() => { if (!cancelled) setContributions([]); })
      .finally(() => { if (!cancelled) setLoadingContributions(false); });
    return () => { cancelled = true; };
  }, []);

  const loadMore = async () => {
    const next = page + 1;
    setLoadingMore(true);
    try {
      const response = await api.get(`/tithe-contributions?per_page=12&page=${next}`);
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setContributions((prev) => [...prev, ...data]);
      setHasMore(data.length === 12);
      setPage(next);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await api.post('/tithes/enroll', {
        suggested_amount: parseFloat(suggestedAmount),
        preferred_day: parseInt(preferredDay),
        reminder_enabled: reminderEnabled,
      });
      const response = await api.get('/tithe-contributions/summary');
      setSummary(response.data);
      setShowEnrollForm(false);
    } finally {
      setEnrolling(false);
    }
  };

  const handleToggleReminder = async () => {
    if (!summary?.tither) return;
    setTogglingReminder(true);
    try {
      await api.put('/tithes/reminder', {
        reminder_enabled: !summary.tither.reminder_enabled,
      });
      setSummary((prev: any) => ({
        ...prev,
        tither: { ...prev.tither, reminder_enabled: !prev.tither.reminder_enabled },
      }));
    } finally {
      setTogglingReminder(false);
    }
  };

  const handleShowCard = async () => {
    if (digitalCard) {
      setShowCard(!showCard);
      return;
    }
    setLoadingCard(true);
    try {
      const response = await api.get('/tithe-contributions/digital-card');
      setDigitalCard(response.data);
      setShowCard(true);
    } finally {
      setLoadingCard(false);
    }
  };

  const formatCurrency = (value: number) => {
    return 'R$ ' + (value ?? 0).toFixed(2).replace('.', ',');
  };

  const formatDate = (date: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Wallet className="h-6 w-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">Dízimos e Ofertas</h1>
      </div>

      {/* Resumo */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h2>

        {summary?.tither ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">N. Dizimista</p>
                <p className="text-sm font-medium text-gray-900">{summary.tither.tither_number}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${summary.tither.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {summary.tither.status === 'active' ? 'Ativo' : summary.tither.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Periodicidade</p>
                <p className="text-sm font-medium text-gray-900">{summary.tither.periodicity}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Valor Sugerido</p>
                <p className="text-sm font-medium text-gray-900">{formatCurrency(summary.tither.suggested_amount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Dia Preferido</p>
                <p className="text-sm font-medium text-gray-900">Dia {summary.tither.preferred_day}</p>
              </div>
              {summary.tither.parish?.name && (
                <div>
                  <p className="text-xs text-gray-500">Paróquia</p>
                  <div className="flex items-center gap-1">
                    <Church className="h-3.5 w-3.5 text-gray-400" />
                    <p className="text-sm font-medium text-gray-900">{summary.tither.parish.name}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-sm text-gray-600">Lembrete</span>
              <button
                onClick={handleToggleReminder}
                disabled={togglingReminder}
                className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50"
              >
                {summary.tither.reminder_enabled ? (
                  <><Bell className="h-4 w-4" /> Ativado</>
                ) : (
                  <><BellOff className="h-4 w-4" /> Desativado</>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500">Total Contribuído</p>
                <p className="text-xl font-bold text-primary-600">{formatCurrency(summary.total_amount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Este Mês</p>
                <p className="text-xl font-bold text-primary-600">{formatCurrency(summary.this_month_amount)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-4">Você ainda não é dizimista.</p>
            {!showEnrollForm ? (
              <button
                onClick={() => setShowEnrollForm(true)}
                className="inline-flex items-center px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
              >
                Torne-se Dizimista
              </button>
            ) : (
              <div className="max-w-sm mx-auto space-y-4 text-left">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Sugerido (R$)</label>
                  <input
                    type="number"
                    value={suggestedAmount}
                    onChange={(e) => setSuggestedAmount(e.target.value)}
                    placeholder="100.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dia Preferido (1-31)</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={preferredDay}
                    onChange={(e) => setPreferredDay(e.target.value)}
                    placeholder="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={reminderEnabled}
                    onChange={(e) => setReminderEnabled(e.target.checked)}
                    className="h-4 w-4 text-primary-600 rounded border-gray-300"
                  />
                  <label className="text-sm text-gray-700">Ativar lembrete</label>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling || !suggestedAmount || !preferredDay}
                    className="flex-1 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
                  >
                    {enrolling ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Confirmar'}
                  </button>
                  <button
                    onClick={() => setShowEnrollForm(false)}
                    className="flex-1 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Carteirinha Digital */}
      {summary?.tither && (
        <div className="mb-6">
          <button
            onClick={handleShowCard}
            disabled={loadingCard}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
          >
            {loadingCard ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            {showCard ? 'Ocultar Carteirinha' : 'Carteirinha Digital'}
          </button>

          {showCard && digitalCard && (
            <div className="mt-4 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl p-6 text-white max-w-sm">
              <p className="text-xs uppercase tracking-wide opacity-80 mb-3">Carteirinha de Dizimista</p>
              {digitalCard.photo && (
                <img src={digitalCard.photo} alt="" className="w-16 h-16 rounded-full border-2 border-white/30 mb-3 object-cover" />
              )}
              <p className="text-lg font-bold">{digitalCard.name}</p>
              <div className="mt-3 space-y-1 text-sm opacity-90">
                <p>N.: {digitalCard.tither_number}</p>
                {digitalCard.parish?.name && <p>Paróquia: {digitalCard.parish.name}</p>}
                <p>Membro desde: {formatDate(digitalCard.member_since)}</p>
                <p>Status: {digitalCard.status === 'active' ? 'Ativo' : digitalCard.status}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Histórico */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Histórico</h2>
        </div>

        {loadingContributions ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
          </div>
        ) : contributions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Nenhuma contribuição encontrada.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contributions.map((c: any) => (
              <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lg font-semibold text-primary-600">{formatCurrency(c.amount)}</p>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(c.paid_at)}</p>
                  </div>
                </div>
                {c.parish?.name && (
                  <p className="text-sm text-gray-500 mt-2">{c.parish.name}</p>
                )}
              </div>
            ))}

            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="w-full py-3 text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50"
              >
                {loadingMore ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  'Carregar mais'
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
