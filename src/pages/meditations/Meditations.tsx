import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Calendar, User, ChevronRight, BookOpen } from 'lucide-react';
import api from '@/lib/api';

interface Meditation {
  id: number;
  title: string;
  passage_reference: string;
  reflection: string;
  author: string;
  image_url: string | null;
  tags: string[];
  published_at: string;
  views_count: number;
}

interface Meta {
  current_page: number;
  last_page: number;
}

export default function Meditations() {
  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  async function fetchMeditations(pageNum: number, append = false) {
    try {
      const response = await api.get(`/meditations?per_page=10&page=${pageNum}`);
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      const responseMeta = response.data.meta;

      if (append) {
        setMeditations((prev) => [...prev, ...data]);
      } else {
        setMeditations(data);
      }
      setMeta(responseMeta);
    } catch {
      setError('Erro ao carregar as meditacoes. Tente novamente mais tarde.');
    }
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      await fetchMeditations(1);
      setLoading(false);
    }
    load();
  }, []);

  async function handleLoadMore() {
    const nextPage = page + 1;
    setLoadingMore(true);
    setPage(nextPage);
    await fetchMeditations(nextPage, true);
    setLoadingMore(false);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
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
          <Heart className="h-6 w-6 text-primary-500" />
          <h1 className="text-2xl font-bold text-gray-900">Meditacoes</h1>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Heart className="h-6 w-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">Meditacoes</h1>
      </div>

      {/* Empty state */}
      {meditations.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-1">
            Nenhuma meditacao disponivel
          </h2>
          <p className="text-sm text-gray-500">
            Novas meditacoes serao publicadas em breve.
          </p>
        </div>
      )}

      {/* Meditation cards */}
      <div className="space-y-3">
        {meditations.map((meditation) => (
          <Link
            key={meditation.id}
            to={`/meditacoes/${meditation.id}`}
            className="block bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-sm transition-all overflow-hidden"
          >
            <div className="flex">
              {/* Thumbnail */}
              {meditation.image_url && (
                <div className="flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32">
                  <img
                    src={meditation.image_url}
                    alt={meditation.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 p-4 min-w-0 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                    {meditation.title}
                  </h3>
                  <p className="text-xs text-primary-600 font-medium mb-2">
                    {meditation.passage_reference}
                  </p>

                  {/* Tags */}
                  {meditation.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {meditation.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {meditation.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(meditation.published_at)}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Load more */}
      {meta && meta.current_page < meta.last_page && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loadingMore ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Carregando...
              </>
            ) : (
              'Carregar mais'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
