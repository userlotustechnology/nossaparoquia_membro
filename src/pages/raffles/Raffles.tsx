import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Ticket, Users, Loader2 } from 'lucide-react';

export default function Raffles() {
  const [raffles, setRaffles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get('/raffles?per_page=10&page=1')
      .then((response) => {
        if (cancelled) return;
        const data = Array.isArray(response.data.data) ? response.data.data : [];
        setRaffles(data);
        setHasMore(data.length === 10);
      })
      .catch(() => { if (!cancelled) setRaffles([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const loadMore = async () => {
    const next = page + 1;
    setLoadingMore(true);
    try {
      const response = await api.get(`/raffles?per_page=10&page=${next}`);
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setRaffles((prev) => [...prev, ...data]);
      setHasMore(data.length === 10);
      setPage(next);
    } finally {
      setLoadingMore(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      open: 'bg-green-100 text-green-700',
      drawn: 'bg-blue-100 text-blue-700',
    };
    const labels: Record<string, string> = {
      open: 'Aberto',
      drawn: 'Sorteado',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-700'}`}>
        {labels[status] ?? status}
      </span>
    );
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Ticket className="h-6 w-6 text-primary-500" />
          <h1 className="text-2xl font-bold text-gray-900">Sorteios</h1>
        </div>
        <Link
          to="/meus-sorteios"
          className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          <Ticket className="h-4 w-4" />
          Meus Sorteios
        </Link>
      </div>

      {raffles.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Nenhum sorteio encontrado.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {raffles.map((raffle: any) => (
            <Link key={raffle.id} to={`/sorteios/${raffle.id}`}>
              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">{raffle.title}</h2>
                  {raffle.status && statusBadge(raffle.status)}
                </div>

                {raffle.description && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{raffle.description}</p>
                )}

                <div className="mt-3 space-y-1 text-sm text-gray-500">
                  {raffle.type && <p>Tipo: {raffle.type}</p>}
                  {raffle.max_participants && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>Máx. participantes: {raffle.max_participants}</span>
                    </div>
                  )}
                  {raffle.parish?.name && (
                    <p>Paróquia: {raffle.parish.name}</p>
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
