import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, HandHeart } from 'lucide-react';
import api from '@/lib/api';

interface PrayerCategory {
  id: number;
  name: string;
}

interface PrayerTag {
  id: number;
  name: string;
}

interface PrayerData {
  id: number;
  title: string;
  slug: string;
  text: string;
  author: string | null;
  origin: string | null;
  category: PrayerCategory;
  is_favorited: boolean;
  favorites_count: number;
  tags: PrayerTag[];
}

export default function PrayerDetail() {
  const { id } = useParams<{ id: string }>();
  const [prayer, setPrayer] = useState<PrayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingFavorite, setTogglingFavorite] = useState(false);

  useEffect(() => {
    const fetchPrayer = async () => {
      try {
        const response = await api.get<{ data: PrayerData }>(`/prayers/${id}`);
        setPrayer(response.data.data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchPrayer();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!prayer || togglingFavorite) return;

    const wasFavorited = prayer.is_favorited;

    setPrayer({
      ...prayer,
      is_favorited: !wasFavorited,
      favorites_count: wasFavorited ? prayer.favorites_count - 1 : prayer.favorites_count + 1,
    });

    setTogglingFavorite(true);

    try {
      if (wasFavorited) {
        await api.delete(`/prayers/${prayer.id}/favorite`);
      } else {
        await api.post(`/prayers/${prayer.id}/favorite`);
      }
    } catch {
      setPrayer((prev) =>
        prev
          ? {
              ...prev,
              is_favorited: wasFavorited,
              favorites_count: wasFavorited
                ? prev.favorites_count + 1
                : prev.favorites_count - 1,
            }
          : prev,
      );
    } finally {
      setTogglingFavorite(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!prayer) {
    return (
      <div className="text-center py-24">
        <HandHeart className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500 mb-4">Oração não encontrada.</p>
        <Link
          to="/oracoes"
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          Voltar para Orações
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        to="/oracoes"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Orações
      </Link>

      {/* Prayer Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        {/* Category Badge */}
        <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 mb-4">
          {prayer.category.name}
        </span>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{prayer.title}</h1>

        {/* Author / Origin */}
        {(prayer.author || prayer.origin) && (
          <div className="mb-6">
            {prayer.author && (
              <p className="text-sm text-gray-500">
                Por <span className="font-medium text-gray-700">{prayer.author}</span>
              </p>
            )}
            {prayer.origin && (
              <p className="text-sm text-gray-400">{prayer.origin}</p>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100 my-6" />

        {/* Prayer Text */}
        <div
          className="text-lg leading-relaxed text-gray-800 whitespace-pre-line"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          {prayer.text}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-6" />

        {/* Actions Row */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleToggleFavorite}
            disabled={togglingFavorite}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors ${
              prayer.is_favorited
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                prayer.is_favorited ? 'fill-red-500 text-red-500' : 'text-gray-400'
              }`}
            />
            {prayer.is_favorited ? 'Favoritada' : 'Favoritar'}
          </button>

          <span className="flex items-center gap-1.5 text-sm text-gray-400">
            <Heart className="h-4 w-4" />
            {prayer.favorites_count}
          </span>
        </div>

        {/* Tags */}
        {prayer.tags && prayer.tags.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {prayer.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
