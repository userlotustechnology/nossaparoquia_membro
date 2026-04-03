import { useState, useEffect } from 'react';
import { Cross, Clock, User, Church, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

interface Schedule {
  id: number;
  day: string;
  time_start: string;
  time_end: string;
  priest_name: string;
  parish: string;
}

interface Checkin {
  id: number;
  status: 'waiting' | 'attended' | 'cancelled';
  date: string;
  position: number;
  schedule?: {
    day: string;
    parish: string;
  };
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  waiting: { label: 'Aguardando', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  attended: { label: 'Atendido', bg: 'bg-green-50', text: 'text-green-700' },
  cancelled: { label: 'Cancelado', bg: 'bg-gray-100', text: 'text-gray-500' },
};

export default function Confessions() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [loadingCheckins, setLoadingCheckins] = useState(true);
  const [checkinResult, setCheckinResult] = useState<Record<number, number | null>>({});
  const [submittingCheckin, setSubmittingCheckin] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await api.get('/confessions/schedules');
        const d = response.data.data;
        setSchedules(Array.isArray(d) ? d : []);
      } catch {
        // silently fail
      } finally {
        setLoadingSchedules(false);
      }
    };

    const fetchCheckins = async () => {
      try {
        const response = await api.get('/confessions/my-checkins?per_page=10');
        const d = response.data.data;
        setCheckins(Array.isArray(d) ? d : []);
      } catch {
        // silently fail
      } finally {
        setLoadingCheckins(false);
      }
    };

    fetchSchedules();
    fetchCheckins();
  }, []);

  const handleCheckin = async (scheduleId: number) => {
    setSubmittingCheckin(scheduleId);
    try {
      const response = await api.post(`/confessions/schedules/${scheduleId}/checkin`);
      const data = response.data.data;
      setCheckinResult((prev) => ({ ...prev, [scheduleId]: data?.position ?? null }));
      // Refresh checkins
      const refreshed = await api.get('/confessions/my-checkins?per_page=10');
      const d = refreshed.data.data;
      setCheckins(Array.isArray(d) ? d : []);
    } catch {
      // silently fail
    } finally {
      setSubmittingCheckin(null);
    }
  };

  const handleCancel = async (checkinId: number) => {
    setCancellingId(checkinId);
    try {
      await api.delete(`/confessions/checkins/${checkinId}`);
      setCheckins((prev) =>
        prev.map((c) => (c.id === checkinId ? { ...c, status: 'cancelled' as const } : c)),
      );
    } catch {
      // silently fail
    } finally {
      setCancellingId(null);
    }
  };

  const isLoading = loadingSchedules && loadingCheckins;

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Cross className="h-6 w-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">Confissoes</h1>
      </div>

      {/* Section 1 - Schedules */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Horarios de Confissao</h2>
        {loadingSchedules ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
          </div>
        ) : schedules.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <Clock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Nenhum horario de confissao disponivel.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="font-bold text-gray-900 capitalize">{schedule.day}</p>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>
                        {schedule.time_start} - {schedule.time_end}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <User className="h-4 w-4 flex-shrink-0" />
                      <span>{schedule.priest_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Church className="h-4 w-4 flex-shrink-0" />
                      <span>{schedule.parish}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {checkinResult[schedule.id] != null ? (
                      <div className="text-center">
                        <div className="flex items-center gap-1.5 text-green-600 bg-green-50 rounded-lg px-3 py-2">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Check-in feito</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Posicao na fila: <span className="font-semibold">{checkinResult[schedule.id]}</span>
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCheckin(schedule.id)}
                        disabled={submittingCheckin === schedule.id}
                        className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submittingCheckin === schedule.id ? 'Aguarde...' : 'Fazer Check-in'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2 - My Checkins */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Meus Check-ins</h2>
        {loadingCheckins ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
          </div>
        ) : checkins.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <AlertCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Voce ainda nao fez nenhum check-in.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {checkins.map((checkin) => {
              const statusCfg = STATUS_CONFIG[checkin.status] ?? STATUS_CONFIG.cancelled;
              return (
                <div key={checkin.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.bg} ${statusCfg.text}`}
                        >
                          {statusCfg.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(checkin.date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-sm text-gray-500">
                        Posicao: <span className="font-medium">{checkin.position}</span>
                      </p>
                      {checkin.schedule && (
                        <p className="text-xs text-gray-400">
                          {checkin.schedule.day} - {checkin.schedule.parish}
                        </p>
                      )}
                    </div>
                    {checkin.status === 'waiting' && (
                      <button
                        onClick={() => handleCancel(checkin.id)}
                        disabled={cancellingId === checkin.id}
                        className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      >
                        <XCircle className="h-4 w-4" />
                        {cancellingId === checkin.id ? 'Cancelando...' : 'Cancelar'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
