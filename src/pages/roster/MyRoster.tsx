import { useState, useEffect } from 'react';
import { CalendarCheck, Plus, X, Check, XCircle } from 'lucide-react';
import api from '@/lib/api';

const statusConfig: Record<string, { label: string; classes: string }> = {
  pending: { label: 'Pendente', classes: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmado', classes: 'bg-green-100 text-green-800' },
  declined: { label: 'Recusado', classes: 'bg-red-100 text-red-800' },
};

export default function MyRoster() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [unavailabilities, setUnavailabilities] = useState<any[]>([]);
  const [loadingUnavail, setLoadingUnavail] = useState(true);
  const [showUnavailForm, setShowUnavailForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submittingUnavail, setSubmittingUnavail] = useState(false);
  const [respondingId, setRespondingId] = useState<number | null>(null);

  useEffect(() => {
    api.get('/roster-assignments?per_page=10')
      .then((res) => {
        setAssignments(Array.isArray(res.data.data) ? res.data.data : []);
      })
      .catch(() => {
        setAssignments([]);
      })
      .finally(() => {
        setLoadingAssignments(false);
      });

    api.get('/unavailabilities')
      .then((res) => {
        const data = res.data.data ?? res.data;
        setUnavailabilities(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setUnavailabilities([]);
      })
      .finally(() => {
        setLoadingUnavail(false);
      });
  }, []);

  function handleRespond(id: number, action: 'confirm' | 'decline') {
    setRespondingId(id);
    api.post(`/roster-assignments/${id}/respond`, { action })
      .then(() => {
        setAssignments((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, status: action === 'confirm' ? 'confirmed' : 'declined' } : a
          )
        );
      })
      .catch(() => {})
      .finally(() => {
        setRespondingId(null);
      });
  }

  function handleAddUnavailability(e: React.FormEvent) {
    e.preventDefault();
    setSubmittingUnavail(true);
    api.post('/unavailabilities', { start_date: startDate, end_date: endDate, reason })
      .then((res) => {
        const newItem = res.data.data ?? res.data;
        setUnavailabilities((prev) => [...prev, newItem]);
        setShowUnavailForm(false);
        setStartDate('');
        setEndDate('');
        setReason('');
      })
      .catch(() => {})
      .finally(() => {
        setSubmittingUnavail(false);
      });
  }

  function handleRemoveUnavailability(id: number) {
    api.delete(`/unavailabilities/${id}`)
      .then(() => {
        setUnavailabilities((prev) => prev.filter((u) => u.id !== id));
      })
      .catch(() => {});
  }

  return (
    <div className="space-y-8">
      {/* Minhas Escalas */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <CalendarCheck className="h-6 w-6 text-primary-500" />
          <h1 className="text-2xl font-bold text-gray-900">Minhas Escalas</h1>
        </div>

        {loadingAssignments ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Nenhuma escala encontrada.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((a) => {
              const status = statusConfig[a.status] ?? { label: a.status, classes: 'bg-gray-100 text-gray-600' };
              const roleColor = a.role?.color ?? '#6366f1';
              return (
                <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block w-3 h-3 rounded-full"
                          style={{ backgroundColor: roleColor }}
                        />
                        <h3 className="text-base font-semibold text-gray-900">
                          {a.role?.name ?? 'Funcao'}
                        </h3>
                      </div>
                      <div className="mt-2 space-y-1">
                        {a.celebration_date && (
                          <p className="text-sm text-gray-600">
                            {new Date(a.celebration_date).toLocaleDateString('pt-BR')}
                            {a.mass_time ? ` - ${a.mass_time}` : ''}
                          </p>
                        )}
                        {a.parish && (
                          <p className="text-sm text-gray-500">{typeof a.parish === 'string' ? a.parish : a.parish.name}</p>
                        )}
                      </div>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${status.classes}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                    {a.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRespond(a.id, 'confirm')}
                          disabled={respondingId === a.id}
                          className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 transition-colors disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" />
                          Confirmar
                        </button>
                        <button
                          onClick={() => handleRespond(a.id, 'decline')}
                          disabled={respondingId === a.id}
                          className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" />
                          Recusar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Indisponibilidades */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Indisponibilidades</h2>
          <button
            onClick={() => setShowUnavailForm(!showUnavailForm)}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            {showUnavailForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showUnavailForm ? 'Cancelar' : 'Adicionar'}
          </button>
        </div>

        {showUnavailForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
            <form onSubmit={handleAddUnavailability} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Inicio</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                type="submit"
                disabled={submittingUnavail}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {submittingUnavail ? 'Salvando...' : 'Salvar'}
              </button>
            </form>
          </div>
        )}

        {loadingUnavail ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          </div>
        ) : unavailabilities.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Nenhuma indisponibilidade registrada.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {unavailabilities.map((u) => (
              <div key={u.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {u.start_date ? new Date(u.start_date).toLocaleDateString('pt-BR') : ''} - {u.end_date ? new Date(u.end_date).toLocaleDateString('pt-BR') : ''}
                  </p>
                  {u.reason && <p className="text-sm text-gray-500 mt-1">{u.reason}</p>}
                </div>
                <button
                  onClick={() => handleRemoveUnavailability(u.id)}
                  className="text-red-500 hover:text-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
