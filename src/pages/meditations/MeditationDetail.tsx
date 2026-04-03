import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ArrowLeft, Calendar, User, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

interface MeditationData {
  id: number;
  title: string;
  passage_reference: string;
  passage_text: string | null;
  reflection: string;
  author: string;
  image_url: string | null;
  tags: string[];
  published_at: string;
  views_count: number;
}

export default function MeditationDetail() {
  const { id } = useParams<{ id: string }>();
  const [meditation, setMeditation] = useState<MeditationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMeditation() {
      try {
        const response = await api.get(`/meditations/${id}`);
        setMeditation(response.data.data);
      } catch {
        setError('Erro ao carregar a meditacao. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    }
    fetchMeditation();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (error || !meditation) {
    return (
      <div>
        <Link
          to="/meditacoes"
          className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 mb-5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para meditacoes
        </Link>
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-sm text-gray-500">
            {error || 'Meditacao nao encontrada.'}
          </p>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(meditation.published_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div>
      {/* Back link */}
      <Link
        to="/meditacoes"
        className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 mb-5 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para meditacoes
      </Link>

      {/* Hero image */}
      {meditation.image_url && (
        <div className="rounded-xl overflow-hidden mb-5 border border-gray-200">
          <img
            src={meditation.image_url}
            alt={meditation.title}
            className="w-full h-48 sm:h-64 object-cover"
          />
        </div>
      )}

      {/* Header card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="h-5 w-5 text-primary-500" />
          <span className="text-sm font-medium text-primary-600">
            {meditation.passage_reference}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {meditation.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            {meditation.author}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {formattedDate}
          </span>
        </div>

        {/* Tags */}
        {meditation.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {meditation.tags.map((tag) => (
              <span
                key={tag}
                className="inline-block bg-primary-50 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Passage text quote block */}
      {meditation.passage_text && (
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-5 mb-4">
          <p className="text-amber-900 text-sm leading-relaxed italic whitespace-pre-line">
            {meditation.passage_text}
          </p>
          <p className="text-xs text-amber-700 font-medium mt-3">
            -- {meditation.passage_reference}
          </p>
        </div>
      )}

      {/* Reflection body */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
          {meditation.reflection}
        </p>
      </div>
    </div>
  );
}
