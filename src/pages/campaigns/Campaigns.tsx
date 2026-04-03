import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { HeartHandshake, CalendarDays, Loader2 } from 'lucide-react';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get('/campaigns?per_page=10&page=1')
      .then((response) => {
        if (cancelled) return;
        const data = Array.isArray(response.data.data) ? response.data.data : [];
        setCampaigns(data);
        setHasMore(data.length === 10);
      })
      .catch(() => { if (!cancelled) setCampaigns([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const loadMore = async () => {
    const next = page + 1;
    setLoadingMore(true);
    try {
      const response = await api.get(`/campaigns?per_page=10&page=${next}`);
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setCampaigns((prev) => [...prev, ...data]);
      setHasMore(data.length === 10);
      setPage(next);
    } finally {
      setLoadingMore(false);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0);
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
        <HeartHandshake className="h-6 w-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">Campanhas</h1>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Nenhuma campanha encontrada.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign: any) => (
            <Link key={campaign.id} to={`/campanhas/${campaign.id}`}>
              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">{campaign.title}</h2>
                  {campaign.is_active !== undefined && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${campaign.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {campaign.is_active ? 'Ativa' : 'Encerrada'}
                    </span>
                  )}
                </div>

                {campaign.description && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{campaign.description}</p>
                )}

                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">
                      {formatCurrency(campaign.collected_amount)} de {formatCurrency(campaign.goal_amount)}
                    </span>
                    <span className="font-medium text-primary-600">
                      {campaign.progress_percent ?? 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(campaign.progress_percent ?? 0, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-sm text-gray-500">
                  {campaign.deadline && (
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-gray-400" />
                      <span>Prazo: {formatDate(campaign.deadline)}</span>
                    </div>
                  )}
                  {campaign.parish?.name && (
                    <p>Paróquia: {campaign.parish.name}</p>
                  )}
                </div>
              </div>
            </Link>
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
  );
}
