import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowLeft, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

interface WeekDay {
  date: string;
  celebration_name: string;
  liturgical_color: string;
  liturgical_color_hex: string;
  gospel_reference: string;
  saint_of_day: string | null;
}

export default function LiturgyWeek() {
  const [days, setDays] = useState<WeekDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeek() {
      try {
        const response = await api.get('/liturgy/week');
        setDays(response.data.data);
      } catch {
        setError('Erro ao carregar a liturgia da semana. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    }
    fetchWeek();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  function formatDayShort(dateStr: string) {
    const date = new Date(dateStr + 'T12:00:00');
    const weekday = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
    const dayMonth = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    return { weekday, dayMonth };
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="h-6 w-6 text-primary-500" />
          <h1 className="text-2xl font-bold text-gray-900">Liturgia da Semana</h1>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="h-6 w-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">Liturgia da Semana</h1>
      </div>

      {/* Back to today */}
      <Link
        to="/liturgia"
        className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 mb-5 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para liturgia de hoje
      </Link>

      {/* Day cards */}
      <div className="space-y-3">
        {days.map((day) => {
          const isToday = day.date === todayStr;
          const { weekday, dayMonth } = formatDayShort(day.date);

          return (
            <div
              key={day.date}
              className={`bg-white rounded-xl border p-5 transition-colors ${
                isToday
                  ? 'border-primary-500 bg-primary-50/30 ring-1 ring-primary-200'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Date column */}
                <div className="flex-shrink-0 text-center w-14">
                  <span className="text-xs font-medium text-gray-500 uppercase block">
                    {weekday}
                  </span>
                  <span
                    className={`text-sm font-bold block ${
                      isToday ? 'text-primary-600' : 'text-gray-700'
                    }`}
                  >
                    {dayMonth}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: day.liturgical_color_hex }}
                      title={day.liturgical_color}
                    />
                    <h3
                      className={`font-semibold text-sm truncate ${
                        isToday ? 'text-primary-800' : 'text-gray-900'
                      }`}
                    >
                      {day.celebration_name}
                    </h3>
                    {isToday && (
                      <span className="flex-shrink-0 text-xs bg-primary-100 text-primary-700 font-medium px-2 py-0.5 rounded-full">
                        Hoje
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600">
                    Evangelho: {day.gospel_reference}
                  </p>

                  {day.saint_of_day && (
                    <p className="text-xs text-gray-500 mt-1">
                      &#9734; {day.saint_of_day}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {days.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-500">Nenhuma liturgia disponivel para esta semana.</p>
        </div>
      )}
    </div>
  );
}
