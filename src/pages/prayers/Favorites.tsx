import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, HandHeart, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface PrayerCategory {
  id: number;
  name: string;
}

interface Prayer {
  id: number;
  title: string;
  slug: string;
  text: string;
  author: string;
  category: PrayerCategory;
  is_favorited: boolean;
  favorites_count: number;
}

interface PrayersMeta {
  current_page: number;
  last_page: number;
}

export default function Favorites() {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [meta, setMeta] = useState<PrayersMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchFavorites = useCallback(async (page: number, append = false) => {
    if (append) {
      setLoadingMore(true);
    }

    try {
      const response = await api.get<{ data: Prayer[]; meta: PrayersMeta }>(
        '/prayers/favorites',
        { params: { per_page: 20, page } },
      );

      const items = Array.isArray(response.data.data) ? response.data.data : [];
      if (append) {
        setPrayers((prev) => [...prev, ...items]);
      } else {
        setPrayers(items);
      }
      setMeta(response.data.meta);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites(1);
  }, [fetchFavorites]);

  const handleLoadMore = () => {
    if (meta && meta.current_page < meta.last_page) {
      fetchFavorites(meta.current_page + 1, true);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, prayer: Prayer) => {
    e.preventDefault();
    e.stopPropagation();

    setPrayers((prev) => prev.filter((p) => p.id !== prayer.id));

    try {
      await api.delete(`/prayers/${prayer.id}/favorite`);
    } catch {
      setPrayers((prev) => {
        const exists = prev.find((p) => p.id === prayer.id);
        if (!exists) {
          return [...prev, prayer].sort((a, b) => a.title.localeCompare(b.title));
        }
        return prev;
      });
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
      {/* Back Link */}
      <Link
        to="/oracoes"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Orações
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3">
        <Heart className="h-6 w-6 text-red-500" />
        <h1 className="text-2xl font-bold text-gray-900">Orações Favoritas</h1>
      </div>

      {/* Prayer List */}
      {prayers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <HandHeart className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Você ainda não favoritou nenhuma oração.</p>
          <Link
            to="/oracoes"
            className="inline-block mt-4 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Explorar orações
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {prayers.map((prayer) => (
            <Link
              key={prayer.id}
              to={`/oracoes/${prayer.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-6 hover:border-primary-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{prayer.title}</h3>
                  {prayer.author && (
                    <p className="text-sm text-gray-500 mb-2">{prayer.author}</p>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                      {prayer.category.name}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Heart className="h-3 w-3" />
                      {prayer.favorites_count}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => handleToggleFavorite(e, prayer)}
                  className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                </button>
              </div>
            </Link>
          ))}

          {/* Load More */}
          {meta && meta.current_page < meta.last_page && (
            <div className="flex justify-center pt-2">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  'Carregar mais'
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
