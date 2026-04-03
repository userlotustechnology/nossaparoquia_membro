import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  HandHeart,
  Heart,
  Search,
  Star,
  Sun,
  Moon,
  Church,
  Baby,
  Cross,
  BookOpen,
  Flame,
  Shield,
  Loader2,
} from 'lucide-react';
import api from '@/lib/api';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color: string;
  prayers_count: number;
}

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

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  sun: Sun,
  moon: Moon,
  church: Church,
  baby: Baby,
  cross: Cross,
  'book-open': BookOpen,
  flame: Flame,
  shield: Shield,
  heart: Heart,
  star: Star,
};

function getCategoryIcon(iconName: string) {
  return iconMap[iconName] || HandHeart;
}

export default function Prayers() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [meta, setMeta] = useState<PrayersMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const fetchPrayers = useCallback(
    async (page: number, categoryId: number | null, query: string, append = false) => {
      if (append) {
        setLoadingMore(true);
      }

      try {
        const params: Record<string, string | number> = { per_page: 20, page };
        if (categoryId) params.category_id = categoryId;
        if (query.trim()) params.q = query.trim();

        const response = await api.get<{ data: Prayer[]; meta: PrayersMeta }>('/prayers', {
          params,
        });

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
    },
    [],
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get<{ data: Category[] }>('/prayers/categories');
        const cats = response.data.data;
        setCategories(Array.isArray(cats) ? cats : []);
      } catch {
        // silently fail
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    setLoading(true);
    setPrayers([]);
    fetchPrayers(1, selectedCategory, searchQuery);
  }, [selectedCategory, searchQuery, fetchPrayers]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      setLoading(true);
      setPrayers([]);
      fetchPrayers(1, selectedCategory, value);
    }, 400);
    setSearchTimeout(timeout);
  };

  const handleLoadMore = () => {
    if (meta && meta.current_page < meta.last_page) {
      fetchPrayers(meta.current_page + 1, selectedCategory, searchQuery, true);
    }
  };

  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategory((prev) => (prev === categoryId ? null : categoryId));
  };

  const handleToggleFavorite = async (e: React.MouseEvent, prayer: Prayer) => {
    e.preventDefault();
    e.stopPropagation();

    const wasFavorited = prayer.is_favorited;

    setPrayers((prev) =>
      prev.map((p) =>
        p.id === prayer.id
          ? {
              ...p,
              is_favorited: !wasFavorited,
              favorites_count: wasFavorited ? p.favorites_count - 1 : p.favorites_count + 1,
            }
          : p,
      ),
    );

    try {
      if (wasFavorited) {
        await api.delete(`/prayers/${prayer.id}/favorite`);
      } else {
        await api.post(`/prayers/${prayer.id}/favorite`);
      }
    } catch {
      setPrayers((prev) =>
        prev.map((p) =>
          p.id === prayer.id
            ? {
                ...p,
                is_favorited: wasFavorited,
                favorites_count: wasFavorited ? p.favorites_count + 1 : p.favorites_count - 1,
              }
            : p,
        ),
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HandHeart className="h-6 w-6 text-primary-500" />
          <h1 className="text-2xl font-bold text-gray-900">Orações</h1>
        </div>
        <Link
          to="/oracoes/favoritas"
          className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          <Heart className="h-4 w-4" />
          Favoritas
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar orações..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </div>

      {/* Categories Grid */}
      {categories.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((category) => {
            const IconComponent = getCategoryIcon(category.icon);
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                  isSelected
                    ? 'border-2 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                style={
                  isSelected
                    ? { borderColor: category.color, backgroundColor: category.color + '10' }
                    : undefined
                }
              >
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: category.color + '20' }}
                >
                  <IconComponent className="h-5 w-5" style={{ color: category.color }} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{category.name}</p>
                  <p className="text-xs text-gray-500">
                    {category.prayers_count} {category.prayers_count === 1 ? 'oração' : 'orações'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Prayer List */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
        </div>
      ) : prayers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <HandHeart className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Nenhuma oração encontrada.</p>
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
                  <Heart
                    className={`h-5 w-5 transition-colors ${
                      prayer.is_favorited
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-300 hover:text-red-400'
                    }`}
                  />
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
