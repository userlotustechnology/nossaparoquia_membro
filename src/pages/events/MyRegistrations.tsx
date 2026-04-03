import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { ClipboardList, ArrowLeft, CalendarDays, Loader2 } from 'lucide-react';

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get('/my-registrations?per_page=10&page=1')
      .then((response) => {
        if (cancelled) return;
        const data = Array.isArray(response.data.data) ? response.data.data : [];
        setRegistrations(data);
        setHasMore(data.length === 10);
      })
      .catch(() => { if (!cancelled) setRegistrations([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const loadMore = async () => {
    const next = page + 1;
    setLoadingMore(true);
    try {
      const response = await api.get(`/my-registrations?per_page=10&page=${next}`);
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setRegistrations((prev) => [...prev, ...data]);
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

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      confirmed: 'bg-blue-100 text-blue-700',
      attended: 'bg-green-100 text-green-700',
      cancelled: 'bg-gray-100 text-gray-700',
    };
    const labels: Record<string, string> = {
      confirmed: 'Confirmado',
      attended: 'Presente',
      cancelled: 'Cancelado',
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
      <Link to="/eventos" className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Voltar para Eventos
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <ClipboardList className="h-6 w-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">Minhas Inscrições</h1>
      </div>

      {registrations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Nenhuma inscrição encontrada.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg: any) => (
            <div key={reg.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {reg.event?.title ?? 'Evento'}
                </h2>
                {reg.status && statusBadge(reg.status)}
              </div>
              <div className="mt-3 space-y-2 text-sm text-gray-600">
                {reg.event?.starts_at && (
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-400" />
                    <span>{formatDate(reg.event.starts_at)}</span>
                  </div>
                )}
                {reg.registered_at && (
                  <p className="text-gray-500">Inscrito em: {formatDate(reg.registered_at)}</p>
                )}
              </div>
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
