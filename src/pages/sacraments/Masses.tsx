import { useState, useEffect } from 'react';
import { Church, MapPin, Clock, User, Send, X, CheckCircle } from 'lucide-react';
import api from '@/lib/api';

interface Parish {
  id: number;
  name: string;
}

interface Mass {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  celebrant: string;
  parish: Parish;
}

interface IntentionForm {
  type: string;
  content: string;
  intention_for: string;
}

const INTENTION_TYPES: Record<string, string> = {
  thanksgiving: 'Ação de Graças',
  deceased: 'Falecidos',
  health: 'Saúde',
  other: 'Outro',
};

function groupByDate(masses: Mass[]): Record<string, Mass[]> {
  const groups: Record<string, Mass[]> = {};
  for (const mass of masses) {
    const key = mass.date;
    if (!groups[key]) groups[key] = [];
    groups[key].push(mass);
  }
  return groups;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function Masses() {
  const [masses, setMasses] = useState<Mass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMassId, setSelectedMassId] = useState<number | null>(null);
  const [form, setForm] = useState<IntentionForm>({ type: 'thanksgiving', content: '', intention_for: '' });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchMasses = async () => {
      try {
        const response = await api.get('/masses/upcoming');
        const d = response.data.data;
        setMasses(Array.isArray(d) ? d : []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchMasses();
  }, []);

  const handleOpenIntention = (massId: number) => {
    setSelectedMassId(massId);
    setForm({ type: 'thanksgiving', content: '', intention_for: '' });
    setSuccessMessage(null);
  };

  const handleCloseIntention = () => {
    setSelectedMassId(null);
    setForm({ type: 'thanksgiving', content: '', intention_for: '' });
    setSuccessMessage(null);
  };

  const handleSubmitIntention = async () => {
    if (!selectedMassId || !form.content.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/masses/${selectedMassId}/intentions`, {
        type: form.type,
        content: form.content,
        intention_for: form.intention_for || undefined,
      });
      setSuccessMessage('Intenção enviada com sucesso!');
      setForm({ type: 'thanksgiving', content: '', intention_for: '' });
    } catch {
      // silently fail
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

  const grouped = groupByDate(masses);
  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Church className="h-6 w-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">Proximas Missas</h1>
      </div>

      {masses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <Church className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Nenhuma missa programada no momento.</p>
        </div>
      ) : (
        sortedDates.map((date) => (
          <div key={date}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 capitalize">
              {formatDate(date)}
            </h2>
            <div className="space-y-3">
              {grouped[date].map((mass) => (
                <div key={mass.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary-500 flex-shrink-0" />
                        <span className="font-bold text-gray-900">{mass.time}</span>
                      </div>
                      <p className="font-medium text-gray-900">{mass.title}</p>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span>{mass.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <User className="h-4 w-4 flex-shrink-0" />
                        <span>{mass.celebrant}</span>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                        {mass.parish.name}
                      </span>
                    </div>
                    <button
                      onClick={() => handleOpenIntention(mass.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors flex-shrink-0"
                    >
                      <Send className="h-4 w-4" />
                      Enviar Intencao
                    </button>
                  </div>

                  {/* Intention Form */}
                  {selectedMassId === mass.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {successMessage ? (
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-lg p-3">
                          <CheckCircle className="h-5 w-5 flex-shrink-0" />
                          <span className="text-sm font-medium">{successMessage}</span>
                          <button onClick={handleCloseIntention} className="ml-auto">
                            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-700">Nova Intencao</h3>
                            <button onClick={handleCloseIntention}>
                              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                            </button>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                            <select
                              value={form.type}
                              onChange={(e) => setForm({ ...form, type: e.target.value })}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                            >
                              {Object.entries(INTENTION_TYPES).map(([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Intencao</label>
                            <textarea
                              value={form.content}
                              onChange={(e) => setForm({ ...form, content: e.target.value.slice(0, 500) })}
                              maxLength={500}
                              rows={3}
                              placeholder="Descreva sua intencao..."
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"
                            />
                            <p className="text-xs text-gray-400 mt-1">{form.content.length}/500</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Para quem (opcional)
                            </label>
                            <input
                              type="text"
                              value={form.intention_for}
                              onChange={(e) => setForm({ ...form, intention_for: e.target.value })}
                              placeholder="Nome da pessoa"
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                            />
                          </div>
                          <button
                            onClick={handleSubmitIntention}
                            disabled={submitting || !form.content.trim()}
                            className="w-full rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {submitting ? 'Enviando...' : 'Enviar Intencao'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
