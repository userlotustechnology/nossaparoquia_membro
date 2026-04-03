import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { History, ArrowLeft, Loader2 } from 'lucide-react';

export default function PointsHistory() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get('/gamification/history?per_page=15&page=1')
      .then((response) => {
        if (cancelled) return;
        const data = Array.isArray(response.data.data) ? response.data.data : [];
        setEntries(data);
        setHasMore(data.length === 15);
      })
      .catch(() => { if (!cancelled) setEntries([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const loadMore = async () => {
    const next = page + 1;
    setLoadingMore(true);
    try {
      const response = await api.get(`/gamification/history?per_page=15&page=${next}`);
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setEntries((prev) => [...prev, ...data]);
      setHasMore(data.length === 15);
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
        <Link to="/gamificacao" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <History className="h-6 w-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">Histórico de Pontos</h1>
      </div>

      {entries.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Nenhum registro encontrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry: any) => (
            <div key={entry.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{entry.action_name ?? entry.action}</p>
                  {entry.description && (
                    <p className="text-sm text-gray-500 mt-1">{entry.description}</p>
                  )}
                </div>
                <span className="text-sm font-bold text-green-600">+{entry.points}</span>
              </div>
              {entry.earned_at && (
                <p className="text-xs text-gray-400 mt-2">{formatDate(entry.earned_at)}</p>
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
  );
}
