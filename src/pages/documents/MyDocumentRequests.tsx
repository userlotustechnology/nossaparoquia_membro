import { useState, useEffect } from 'react';
import { Files, X } from 'lucide-react';
import api from '@/lib/api';

const statusConfig: Record<string, { label: string; classes: string }> = {
  pending: { label: 'Pendente', classes: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'Processando', classes: 'bg-blue-100 text-blue-800' },
  ready: { label: 'Pronto', classes: 'bg-green-100 text-green-800' },
  delivered: { label: 'Entregue', classes: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelado', classes: 'bg-gray-100 text-gray-600' },
};

export default function MyDocumentRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get('/documents/my-requests?per_page=10&page=1')
      .then((res) => {
        if (cancelled) return;
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        setRequests(data);
        const meta = res.data.meta ?? res.data;
        setHasMore(meta.current_page < meta.last_page);
      })
      .catch(() => { if (!cancelled) setRequests([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function handleLoadMore() {
    const next = page + 1;
    setPage(next);
    setLoadingMore(true);
    api.get(`/documents/my-requests?per_page=10&page=${next}`)
      .then((res) => {
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        setRequests((prev) => [...prev, ...data]);
        const meta = res.data.meta ?? res.data;
        setHasMore(meta.current_page < meta.last_page);
      })
      .finally(() => setLoadingMore(false));
  }

  function handleCancel(id: number) {
    api.delete(`/documents/my-requests/${id}`)
      .then(() => {
        setRequests((prev) => prev.filter((r) => r.id !== id));
      })
      .catch(() => {});
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Files className="h-6 w-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">Meus Documentos</h1>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Nenhuma solicitacao encontrada.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const status = statusConfig[req.status] ?? { label: req.status, classes: 'bg-gray-100 text-gray-600' };
            return (
              <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {req.document_type?.name ?? req.document_type_name ?? 'Documento'}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${status.classes}`}>
                        {status.label}
                      </span>
                      {req.requested_at && (
                        <span className="text-xs text-gray-400">
                          {new Date(req.requested_at).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                    {req.fee != null && (
                      <p className="text-sm text-gray-500 mt-2">Taxa: R$ {Number(req.fee).toFixed(2)}</p>
                    )}
                  </div>
                  {req.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(req.id)}
                      className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
              >
                {loadingMore ? 'Carregando...' : 'Carregar mais'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
