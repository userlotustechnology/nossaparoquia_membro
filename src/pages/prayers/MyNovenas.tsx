import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookMarked,
  ArrowLeft,
  Play,
  Check,
  RotateCcw,
  Trash2,
  X,
  BookOpen,
  ChevronUp,
} from 'lucide-react';
import api from '@/lib/api';

interface ActiveNovena {
  id: number;
  novena_id: number;
  novena_title: string;
  days_completed: number;
  total_days: number;
  current_day: number;
}

interface CompletedNovena {
  id: number;
  novena_id: number;
  novena_title: string;
}

interface AbandonedNovena {
  id: number;
  novena_id: number;
  novena_title: string;
}

interface UserNovenasData {
  active: ActiveNovena[];
  completed: CompletedNovena[];
  abandoned: AbandonedNovena[];
}

interface DayContent {
  day_number: number;
  title: string;
  intro: string;
  prayer_text: string;
  reflection: string;
  scripture_reference: string;
}

interface UserNovenaDetail {
  id: number;
  novena_title: string;
  current_day_content: DayContent;
}

export default function MyNovenas() {
  const [data, setData] = useState<UserNovenasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [dayContent, setDayContent] = useState<DayContent | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [completingDay, setCompletingDay] = useState(false);
  const [abandoningId, setAbandoningId] = useState<number | null>(null);
  const [restartingId, setRestartingId] = useState<number | null>(null);
  const [confirmAbandonId, setConfirmAbandonId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const response = await api.get<{ data: UserNovenasData }>('/user-novenas');
      setData(response.data.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePray = async (userNovenaId: number) => {
    if (expandedId === userNovenaId) {
      setExpandedId(null);
      setDayContent(null);
      return;
    }

    setExpandedId(userNovenaId);
    setLoadingContent(true);
    setDayContent(null);

    try {
      const response = await api.get<{ data: UserNovenaDetail }>(`/user-novenas/${userNovenaId}`);
      setDayContent(response.data.data.current_day_content);
    } catch {
      alert('Erro ao carregar o conteúdo do dia. Tente novamente.');
      setExpandedId(null);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleCompleteDay = async (userNovenaId: number) => {
    setCompletingDay(true);
    try {
      await api.post(`/user-novenas/${userNovenaId}/complete-day`);
      setExpandedId(null);
      setDayContent(null);
      await fetchData();
    } catch {
      alert('Erro ao concluir o dia. Tente novamente.');
    } finally {
      setCompletingDay(false);
    }
  };

  const handleAbandon = async (userNovenaId: number) => {
    setAbandoningId(userNovenaId);
    try {
      await api.delete(`/user-novenas/${userNovenaId}`);
      setConfirmAbandonId(null);
      if (expandedId === userNovenaId) {
        setExpandedId(null);
        setDayContent(null);
      }
      await fetchData();
    } catch {
      alert('Erro ao abandonar a novena. Tente novamente.');
    } finally {
      setAbandoningId(null);
    }
  };

  const handleRestart = async (userNovenaId: number) => {
    setRestartingId(userNovenaId);
    try {
      await api.post(`/user-novenas/${userNovenaId}/restart`);
      await fetchData();
    } catch {
      alert('Erro ao recomeçar a novena. Tente novamente.');
    } finally {
      setRestartingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-24">
        <p className="text-sm text-gray-500">Erro ao carregar suas novenas. Tente novamente.</p>
      </div>
    );
  }

  const hasContent = data.active.length > 0 || data.completed.length > 0 || data.abandoned.length > 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/novenas" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <BookMarked className="h-6 w-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">Minhas Novenas</h1>
      </div>

      {!hasContent ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <BookMarked className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Você ainda não iniciou nenhuma novena</p>
          <Link
            to="/novenas"
            className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            <BookOpen className="h-4 w-4" />
            Explorar novenas
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active */}
          {data.active.length > 0 && (
            <section>
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Play className="h-4 w-4 text-green-500" />
                Ativas ({data.active.length})
              </h2>
              <div className="space-y-4">
                {data.active.map((novena) => {
                  const progress = novena.total_days > 0
                    ? Math.round((novena.days_completed / novena.total_days) * 100)
                    : 0;
                  const isExpanded = expandedId === novena.id;

                  return (
                    <div
                      key={novena.id}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900">{novena.novena_title}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Dia {novena.current_day} de {novena.total_days}
                            </p>
                          </div>
                          <span className="text-sm font-medium text-primary-600">{progress}%</span>
                        </div>

                        {/* Progress bar */}
                        <div className="h-2 rounded-full bg-gray-200 mb-4">
                          <div
                            className="h-2 rounded-full bg-primary-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePray(novena.id)}
                            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 transition-colors"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="h-4 w-4" />
                                Fechar
                              </>
                            ) : (
                              <>
                                <BookOpen className="h-4 w-4" />
                                Rezar
                              </>
                            )}
                          </button>
                          {confirmAbandonId === novena.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleAbandon(novena.id)}
                                disabled={abandoningId === novena.id}
                                className="flex items-center gap-1 rounded-lg bg-red-500 px-3 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                              >
                                {abandoningId === novena.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                                Sim
                              </button>
                              <button
                                onClick={() => setConfirmAbandonId(null)}
                                className="flex items-center rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmAbandonId(novena.id)}
                              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors"
                              title="Abandonar novena"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded pray content */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 bg-gray-50 p-6">
                          {loadingContent ? (
                            <div className="flex justify-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
                            </div>
                          ) : dayContent ? (
                            <div className="space-y-5">
                              <div>
                                <p className="text-xs font-medium text-primary-600 uppercase tracking-wide mb-1">
                                  Dia {dayContent.day_number}
                                </p>
                                <h3 className="text-lg font-bold text-gray-900">{dayContent.title}</h3>
                              </div>

                              {dayContent.intro && (
                                <div>
                                  <p className="text-sm text-gray-600 leading-relaxed">{dayContent.intro}</p>
                                </div>
                              )}

                              {dayContent.scripture_reference && (
                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                    Leitura
                                  </p>
                                  <p className="text-sm text-gray-700 italic">{dayContent.scripture_reference}</p>
                                </div>
                              )}

                              {dayContent.prayer_text && (
                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                    Oração
                                  </p>
                                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                    {dayContent.prayer_text}
                                  </p>
                                </div>
                              )}

                              {dayContent.reflection && (
                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                    Reflexão
                                  </p>
                                  <p className="text-sm text-gray-700 leading-relaxed">
                                    {dayContent.reflection}
                                  </p>
                                </div>
                              )}

                              <button
                                onClick={() => handleCompleteDay(novena.id)}
                                disabled={completingDay}
                                className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-3 text-sm font-semibold text-white hover:bg-green-600 transition-colors disabled:opacity-50"
                              >
                                {completingDay ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                    Concluindo...
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-4 w-4" />
                                    Concluir dia
                                  </>
                                )}
                              </button>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-4">
                              Não foi possível carregar o conteúdo.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Completed */}
          {data.completed.length > 0 && (
            <section>
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Check className="h-4 w-4 text-blue-500" />
                Concluídas ({data.completed.length})
              </h2>
              <div className="space-y-2">
                {data.completed.map((novena) => (
                  <div
                    key={novena.id}
                    className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center justify-between"
                  >
                    <span className="text-sm font-medium text-gray-900">{novena.novena_title}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                      <Check className="h-3 w-3" />
                      Concluída
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Abandoned */}
          {data.abandoned.length > 0 && (
            <section>
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-gray-400" />
                Abandonadas ({data.abandoned.length})
              </h2>
              <div className="space-y-2">
                {data.abandoned.map((novena) => (
                  <div
                    key={novena.id}
                    className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center justify-between"
                  >
                    <span className="text-sm font-medium text-gray-500">{novena.novena_title}</span>
                    <button
                      onClick={() => handleRestart(novena.id)}
                      disabled={restartingId === novena.id}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-primary-600 hover:border-primary-200 transition-colors disabled:opacity-50"
                    >
                      {restartingId === novena.id ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-500" />
                      ) : (
                        <RotateCcw className="h-3 w-3" />
                      )}
                      Recomeçar
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
