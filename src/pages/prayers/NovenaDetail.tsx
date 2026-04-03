import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BookHeart,
  ArrowLeft,
  Users,
  Calendar,
  Trophy,
  Play,
  Check,
  BookOpen,
} from 'lucide-react';
import api from '@/lib/api';

interface NovenaDay {
  id: number;
  day_number: number;
  title: string;
}

interface NovenaDetail {
  id: number;
  title: string;
  description: string;
  saint: string;
  image_url: string | null;
  total_days: number;
  participants_count: number;
  completions_count: number;
  intention_prompt: string | null;
  user_status: 'active' | 'completed' | null;
}

export default function NovenaDetail() {
  const { id } = useParams<{ id: string }>();
  const [novena, setNovena] = useState<NovenaDetail | null>(null);
  const [days, setDays] = useState<NovenaDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [showIntentionInput, setShowIntentionInput] = useState(false);
  const [personalIntention, setPersonalIntention] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [novenaRes, daysRes] = await Promise.all([
          api.get<{ data: NovenaDetail }>(`/novenas/${id}`),
          api.get<{ data: NovenaDay[] }>(`/novenas/${id}/days`),
        ]);
        setNovena(novenaRes.data.data);
        setDays(daysRes.data.data);
      } catch {
        // handled by null check
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleStart = async () => {
    if (!novena) return;

    if (!showIntentionInput && novena.intention_prompt) {
      setShowIntentionInput(true);
      return;
    }

    setStarting(true);
    try {
      const payload: Record<string, string> = {};
      if (personalIntention.trim()) {
        payload.personal_intention = personalIntention.trim();
      }
      await api.post(`/novenas/${novena.id}/start`, payload);
      setNovena({ ...novena, user_status: 'active' });
      setShowIntentionInput(false);
    } catch {
      alert('Erro ao iniciar a novena. Tente novamente.');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!novena) {
    return (
      <div className="text-center py-24">
        <p className="text-sm text-gray-500">Novena não encontrada.</p>
        <Link to="/novenas" className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block">
          Voltar para novenas
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Back link */}
      <Link
        to="/novenas"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      {/* Image banner */}
      {novena.image_url && (
        <div className="rounded-xl overflow-hidden mb-6">
          <img
            src={novena.image_url}
            alt={novena.title}
            className="w-full h-48 sm:h-64 object-cover"
          />
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <BookHeart className="h-6 w-6 text-primary-500" />
          <h1 className="text-2xl font-bold text-gray-900">{novena.title}</h1>
        </div>
        {novena.saint && (
          <p className="text-primary-600 font-medium mb-3">{novena.saint}</p>
        )}
        <p className="text-gray-600 leading-relaxed">{novena.description}</p>
      </div>

      {/* Intention prompt */}
      {novena.intention_prompt && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-5 mb-6">
          <p className="text-sm font-medium text-amber-800 mb-1">Sugestão de intenção</p>
          <p className="text-sm text-amber-700">{novena.intention_prompt}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <Calendar className="h-5 w-5 text-primary-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-900">{novena.total_days}</p>
          <p className="text-xs text-gray-500">dias</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <Users className="h-5 w-5 text-primary-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-900">{novena.participants_count}</p>
          <p className="text-xs text-gray-500">participantes</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <Trophy className="h-5 w-5 text-primary-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-900">{novena.completions_count}</p>
          <p className="text-xs text-gray-500">conclusões</p>
        </div>
      </div>

      {/* Action button */}
      <div className="mb-6">
        {novena.user_status === null && (
          <div>
            {showIntentionInput && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sua intenção pessoal (opcional)
                </label>
                <textarea
                  value={personalIntention}
                  onChange={(e) => setPersonalIntention(e.target.value)}
                  placeholder="Escreva sua intenção pessoal para esta novena..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-1 focus:ring-primary-300"
                />
              </div>
            )}
            <button
              onClick={handleStart}
              disabled={starting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {starting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Iniciando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  {showIntentionInput ? 'Confirmar e Iniciar Novena' : 'Iniciar Novena'}
                </>
              )}
            </button>
          </div>
        )}

        {novena.user_status === 'active' && (
          <Link
            to="/minhas-novenas"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-3 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Continuar Rezando
          </Link>
        )}

        {novena.user_status === 'completed' && (
          <div className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-50 border border-blue-200 px-6 py-3 text-sm font-semibold text-blue-700">
            <Check className="h-4 w-4" />
            Concluída
          </div>
        )}
      </div>

      {/* Days overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Dias da Novena</h2>
        <div className="space-y-2">
          {days.map((day) => (
            <div
              key={day.id}
              className="flex items-center gap-3 rounded-lg p-3 bg-gray-50"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 flex-shrink-0">
                {day.day_number}
              </span>
              <span className="text-sm text-gray-700">{day.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
