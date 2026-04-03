import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link2, Loader2, UserX, Check, X, Trash2 } from 'lucide-react';
import api from '@/lib/api';

interface Connection {
  id: number;
  user: {
    id: number;
    name: string;
    avatar_url: string | null;
  };
}

interface PendingData {
  received: Connection[];
  sent: Connection[];
}

export default function Connections() {
  const [tab, setTab] = useState<'connections' | 'pending'>('connections');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pending, setPending] = useState<PendingData>({ received: [], sent: [] });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchConnections = async (pageNum: number, append = false) => {
    try {
      if (append) setLoadingMore(true); else setLoading(true);
      const response = await api.get('/connections', { params: { per_page: 15, page: pageNum } });
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setConnections(prev => append ? [...prev, ...data] : data);
      setHasMore(data.length === 15);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchPending = async () => {
    try {
      setLoading(true);
      const response = await api.get('/connections/pending');
      const data = response.data.data;
      setPending({
        received: Array.isArray(data?.received) ? data.received : [],
        sent: Array.isArray(data?.sent) ? data.sent : [],
      });
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'connections') {
      setPage(1);
      fetchConnections(1);
    } else {
      fetchPending();
    }
  }, [tab]);

  const handleRemove = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover esta conexão?')) return;
    try {
      setActionLoading(id);
      await api.delete(`/connections/${id}`);
      setConnections(prev => prev.filter(c => c.id !== id));
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  };

  const handleAccept = async (id: number) => {
    try {
      setActionLoading(id);
      await api.post(`/connections/${id}/accept`);
      setPending(prev => ({
        ...prev,
        received: prev.received.filter(c => c.id !== id),
      }));
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (id: number) => {
    try {
      setActionLoading(id);
      await api.post(`/connections/${id}/decline`);
      setPending(prev => ({
        ...prev,
        received: prev.received.filter(c => c.id !== id),
      }));
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (id: number) => {
    try {
      setActionLoading(id);
      await api.post(`/connections/${id}/decline`);
      setPending(prev => ({
        ...prev,
        sent: prev.sent.filter(c => c.id !== id),
      }));
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchConnections(next, true);
  };

  const getInitials = (name: string) =>
    name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const renderAvatar = (user: Connection['user']) =>
    user.avatar_url ? (
      <img src={user.avatar_url} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
    ) : (
      <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold text-sm">
        {getInitials(user.name)}
      </div>
    );

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link2 className="h-6 w-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">Conexões</h1>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('connections')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'connections'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Minhas Conexões
        </button>
        <button
          onClick={() => setTab('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'pending'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Pendentes
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : tab === 'connections' ? (
        <>
          {connections.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm text-gray-500">Você ainda não possui conexões.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {connections.map(conn => (
                <div
                  key={conn.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between"
                >
                  <RouterLink
                    to={`/comunidade/${conn.user.id}`}
                    className="flex items-center gap-3 hover:opacity-80"
                  >
                    {renderAvatar(conn.user)}
                    <span className="font-medium text-gray-900">{conn.user.name}</span>
                  </RouterLink>
                  <button
                    onClick={() => handleRemove(conn.id)}
                    disabled={actionLoading === conn.id}
                    className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    {actionLoading === conn.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <UserX className="h-4 w-4" />
                        Remover
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {hasMore && connections.length > 0 && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 text-sm font-medium"
              >
                {loadingMore ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Carregar mais'
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6">
          {/* Received */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Recebidos</h2>
            {pending.received.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Nenhuma solicitação recebida.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pending.received.map(conn => (
                  <div
                    key={conn.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {renderAvatar(conn.user)}
                      <span className="font-medium text-gray-900">{conn.user.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAccept(conn.id)}
                        disabled={actionLoading === conn.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50"
                      >
                        <Check className="h-4 w-4" />
                        Aceitar
                      </button>
                      <button
                        onClick={() => handleDecline(conn.id)}
                        disabled={actionLoading === conn.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                        Recusar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sent */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Enviados</h2>
            {pending.sent.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Nenhuma solicitação enviada.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pending.sent.map(conn => (
                  <div
                    key={conn.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {renderAvatar(conn.user)}
                      <span className="font-medium text-gray-900">{conn.user.name}</span>
                    </div>
                    <button
                      onClick={() => handleCancel(conn.id)}
                      disabled={actionLoading === conn.id}
                      className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                      {actionLoading === conn.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Cancelar
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
