import { useState, useEffect, useCallback } from 'react';
import {
  Compass,
  UserCheck,
  Clock,
  Users,
  Plus,
  Search,
  Check,
  X,
  Trash2,
  MessageSquare,
  CalendarDays,
  AlertCircle,
} from 'lucide-react';
import api from '@/lib/api';

interface DirectionUser {
  id: number;
  name: string;
  email?: string;
}

interface SpiritualDirection {
  id: number;
  director: DirectionUser;
  directee: DirectionUser;
  status: 'active' | 'pending';
  started_at: string | null;
  message: string | null;
}

interface PendingInvitation {
  id: number;
  director: DirectionUser;
  directee: DirectionUser;
  message: string | null;
  created_at: string;
}

interface AsDirectorEntry {
  id: number;
  directee: DirectionUser;
  status: 'active' | 'pending';
  started_at: string | null;
}

interface SearchResult {
  id: number;
  name: string;
  email: string;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function SpiritualDirection() {
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState<SpiritualDirection | null>(null);
  const [hasDirection, setHasDirection] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [asDirector, setAsDirector] = useState<AsDirectorEntry[]>([]);

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedDirector, setSelectedDirector] = useState<SearchResult | null>(null);
  const [inviteMessage, setInviteMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [dirRes, invRes, asDirRes] = await Promise.all([
        api.get('/spiritual-direction'),
        api.get('/spiritual-direction/pending-invitations'),
        api.get('/spiritual-direction/as-director'),
      ]);

      const dirData = dirRes.data.data;
      if (dirData && dirData.has_direction) {
        setHasDirection(true);
        setDirection(dirData.direction ?? dirData);
      } else {
        setHasDirection(false);
        setDirection(null);
      }

      const invData = invRes.data.data;
      setPendingInvitations(Array.isArray(invData) ? invData : []);

      const asDirData = asDirRes.data.data;
      setAsDirector(Array.isArray(asDirData) ? asDirData : []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEndDirection = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja encerrar esta direção espiritual?')) return;
    setActionLoading(id);
    try {
      await api.delete(`/spiritual-direction/${id}`);
      setHasDirection(false);
      setDirection(null);
      await fetchData();
    } catch {
      setError('Erro ao encerrar direção espiritual.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAcceptInvitation = async (id: number) => {
    setActionLoading(id);
    try {
      await api.post(`/spiritual-direction/${id}/accept`);
      await fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao aceitar convite.';
      setError(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineInvitation = async (id: number) => {
    setActionLoading(id);
    try {
      await api.post(`/spiritual-direction/${id}/decline`);
      await fetchData();
    } catch {
      setError('Erro ao recusar convite.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSearchDirector = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const response = await api.get('/spiritual-direction/search-directors', {
        params: { q: searchQuery },
      });
      const results = response.data.data;
      setSearchResults(Array.isArray(results) ? results : []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleInviteSubmit = async () => {
    if (!selectedDirector) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/spiritual-direction', {
        director_id: selectedDirector.id,
        message: inviteMessage || undefined,
      });
      setShowInviteForm(false);
      setSearchQuery('');
      setSearchResults([]);
      setSelectedDirector(null);
      setInviteMessage('');
      await fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao enviar convite.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Compass className="h-6 w-6 text-primary-500" />
          <h1 className="text-2xl font-bold text-gray-900">Direção Espiritual</h1>
        </div>
        {!hasDirection && !showInviteForm && (
          <button
            onClick={() => setShowInviteForm(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Convidar Diretor
          </button>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-4">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Invite Form */}
      {showInviteForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Convidar Diretor Espiritual</h2>
            <button
              onClick={() => {
                setShowInviteForm(false);
                setSearchQuery('');
                setSearchResults([]);
                setSelectedDirector(null);
                setInviteMessage('');
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {!selectedDirector ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchDirector()}
                    placeholder="Buscar por nome ou e-mail..."
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                  />
                </div>
                <button
                  onClick={handleSearchDirector}
                  disabled={searching}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {searching ? 'Buscando...' : 'Buscar'}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-48 overflow-y-auto">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedDirector(user)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <UserCheck className="h-4 w-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              )}

              {searchResults.length === 0 && searchQuery && !searching && (
                <p className="text-sm text-gray-500">Nenhum resultado encontrado.</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg">
                <UserCheck className="h-5 w-5 text-primary-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary-900">{selectedDirector.name}</p>
                  <p className="text-xs text-primary-600">{selectedDirector.email}</p>
                </div>
                <button
                  onClick={() => setSelectedDirector(null)}
                  className="text-primary-400 hover:text-primary-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem (opcional)
                </label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  rows={3}
                  placeholder="Escreva uma mensagem para o diretor..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none resize-none"
                />
              </div>

              <button
                onClick={handleInviteSubmit}
                disabled={submitting}
                className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Enviando...' : 'Enviar Convite'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Section 1 - Minha Direção Espiritual */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Compass className="h-5 w-5 text-primary-500" />
          <h2 className="font-semibold text-gray-900">Minha Direção Espiritual</h2>
        </div>

        {hasDirection && direction ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    Diretor: <span className="font-medium text-gray-900">{direction.director.name}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Início: {formatDate(direction.started_at)}</span>
                </div>
                {direction.message && (
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                    <p className="text-sm text-gray-600">{direction.message}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    direction.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {direction.status === 'active' ? 'Ativa' : 'Pendente'}
                </span>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <button
                onClick={() => handleEndDirection(direction.id)}
                disabled={actionLoading === direction.id}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {actionLoading === direction.id ? 'Encerrando...' : 'Encerrar'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Você não possui uma direção espiritual ativa. Convide um diretor para começar.
          </p>
        )}
      </div>

      {/* Section 2 - Convites Pendentes */}
      {pendingInvitations.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-amber-500" />
            <h2 className="font-semibold text-gray-900">Convites Pendentes</h2>
          </div>
          <div className="space-y-4">
            {pendingInvitations.map((inv) => (
              <div key={inv.id} className="p-4 border border-gray-100 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <p className="text-sm text-gray-700">
                      De: <span className="font-medium text-gray-900">{inv.directee.name}</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      Diretor: <span className="font-medium text-gray-900">{inv.director.name}</span>
                    </p>
                    {inv.message && (
                      <div className="flex items-start gap-2 mt-1">
                        <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                        <p className="text-sm text-gray-600">{inv.message}</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-400">Recebido em {formatDate(inv.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleAcceptInvitation(inv.id)}
                    disabled={actionLoading === inv.id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    {actionLoading === inv.id ? '...' : 'Aceitar'}
                  </button>
                  <button
                    onClick={() => handleDeclineInvitation(inv.id)}
                    disabled={actionLoading === inv.id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    Recusar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3 - Como Diretor */}
      {asDirector.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-indigo-500" />
            <h2 className="font-semibold text-gray-900">Como Diretor</h2>
          </div>
          <div className="space-y-3">
            {asDirector.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 border border-gray-100 rounded-lg"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900">{entry.directee.name}</p>
                  <p className="text-xs text-gray-500">Início: {formatDate(entry.started_at)}</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    entry.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {entry.status === 'active' ? 'Ativa' : 'Pendente'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
