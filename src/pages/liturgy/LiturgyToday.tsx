import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, ChevronDown, ChevronUp, ChevronRight, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

interface ReadingSection {
  reference: string | null;
  title: string | null;
  text: string | null;
}

interface PsalmSection {
  reference: string | null;
  response: string | null;
  text: string | null;
}

interface GospelSection {
  acclamation: string | null;
  reference: string | null;
  title: string | null;
  text: string | null;
}

interface LiturgyData {
  date: string;
  celebration_name: string;
  liturgical_color: string;
  liturgical_color_hex: string;
  saint_of_day: string | null;
  prayer_of_day: string | null;
  first_reading: ReadingSection;
  psalm: PsalmSection;
  second_reading: ReadingSection;
  gospel: GospelSection;
}

function ReadingAccordion({
  title,
  reference,
  children,
  defaultOpen = false,
}: {
  title: string;
  reference: string | null;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
      >
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {reference && (
            <span className="text-sm text-primary-600 mt-0.5">{reference}</span>
          )}
        </div>
        {open ? (
          <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

export default function LiturgyToday() {
  const [liturgy, setLiturgy] = useState<LiturgyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    async function fetchLiturgy() {
      try {
        const response = await api.get('/liturgy/today');
        setLiturgy(response.data.data);
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr.response?.status === 503) {
          setUnavailable(true);
        } else {
          setError('Erro ao carregar a liturgia. Tente novamente mais tarde.');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchLiturgy();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (unavailable) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="h-6 w-6 text-primary-500" />
          <h1 className="text-2xl font-bold text-gray-900">Liturgia de Hoje</h1>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Liturgia indisponivel no momento
          </h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            A liturgia de hoje ainda nao esta disponivel. Por favor, tente novamente mais tarde.
          </p>
        </div>
      </div>
    );
  }

  if (error || !liturgy) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="h-6 w-6 text-primary-500" />
          <h1 className="text-2xl font-bold text-gray-900">Liturgia de Hoje</h1>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(liturgy.date + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="h-6 w-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">Liturgia de Hoje</h1>
      </div>

      {/* Date and celebration */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-center gap-3 mb-2">
          <span
            className="inline-block w-3.5 h-3.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: liturgy.liturgical_color_hex }}
            title={liturgy.liturgical_color}
          />
          <span className="text-sm font-medium text-gray-500 capitalize">
            {liturgy.liturgical_color}
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          {liturgy.celebration_name}
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span className="capitalize">{formattedDate}</span>
        </div>

        {liturgy.saint_of_day && (
          <div className="mt-4 flex items-center gap-2 bg-amber-50 text-amber-800 rounded-lg px-4 py-2.5 text-sm">
            <span className="text-base">&#9734;</span>
            <span>
              <strong>Santo do dia:</strong> {liturgy.saint_of_day}
            </span>
          </div>
        )}
      </div>

      {/* Reading sections */}
      <div className="space-y-3 mb-4">
        {/* Primeira Leitura */}
        <ReadingAccordion
          title="Primeira Leitura"
          reference={liturgy.first_reading.reference}
          defaultOpen
        >
          {liturgy.first_reading.title && (
            <p className="text-sm font-medium text-gray-700 italic mb-3">
              {liturgy.first_reading.title}
            </p>
          )}
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
            {liturgy.first_reading.text}
          </p>
        </ReadingAccordion>

        {/* Salmo Responsorial */}
        <ReadingAccordion
          title="Salmo Responsorial"
          reference={liturgy.psalm.reference}
        >
          {liturgy.psalm.response && (
            <div className="bg-primary-50 border-l-4 border-primary-500 px-4 py-3 mb-4 rounded-r-lg">
              <p className="text-primary-800 font-semibold text-sm italic">
                {liturgy.psalm.response}
              </p>
            </div>
          )}
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
            {liturgy.psalm.text}
          </p>
        </ReadingAccordion>

        {/* Segunda Leitura (conditional) */}
        {liturgy.second_reading.reference && liturgy.second_reading.text && (
          <ReadingAccordion
            title="Segunda Leitura"
            reference={liturgy.second_reading.reference}
          >
            {liturgy.second_reading.title && (
              <p className="text-sm font-medium text-gray-700 italic mb-3">
                {liturgy.second_reading.title}
              </p>
            )}
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
              {liturgy.second_reading.text}
            </p>
          </ReadingAccordion>
        )}

        {/* Evangelho */}
        <ReadingAccordion
          title="Evangelho"
          reference={liturgy.gospel.reference}
        >
          {liturgy.gospel.acclamation && (
            <div className="bg-amber-50 border-l-4 border-amber-400 px-4 py-3 mb-4 rounded-r-lg">
              <p className="text-amber-800 font-medium text-sm">
                {liturgy.gospel.acclamation}
              </p>
            </div>
          )}
          {liturgy.gospel.title && (
            <p className="text-sm font-medium text-gray-700 italic mb-3">
              {liturgy.gospel.title}
            </p>
          )}
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
            {liturgy.gospel.text}
          </p>
        </ReadingAccordion>
      </div>

      {/* Prayer of the day */}
      {liturgy.prayer_of_day && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Oração do Dia</h3>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line italic">
            {liturgy.prayer_of_day}
          </p>
        </div>
      )}

      {/* Link to weekly view */}
      <Link
        to="/liturgia/semana"
        className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-5 hover:bg-gray-50 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary-500" />
          <span className="font-medium text-gray-900">Ver liturgia da semana</span>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
      </Link>
    </div>
  );
}
