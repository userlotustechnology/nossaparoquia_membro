import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Video, PlayCircle, Tag, Loader2 } from 'lucide-react';

export default function Videos() {
  const [categories, setCategories] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get('/videos/categories')
      .then((response) => {
        if (cancelled) return;
        const data = Array.isArray(response.data.data) ? response.data.data : [];
        setCategories(data);
      })
      .catch(() => { if (!cancelled) setCategories([]); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ per_page: '10', page: '1' });
    if (selectedCategory) params.set('category_id', String(selectedCategory));
    api.get(`/videos/playlists?${params.toString()}`)
      .then((response) => {
        if (cancelled) return;
        const data = Array.isArray(response.data.data) ? response.data.data : [];
        setPlaylists(data);
        setHasMore(data.length === 10);
      })
      .catch(() => { if (!cancelled) setPlaylists([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedCategory]);

  const loadMore = () => {
    const next = page + 1;
    setLoadingMore(true);
    const params = new URLSearchParams({ per_page: '10', page: String(next) });
    if (selectedCategory) params.set('category_id', String(selectedCategory));
    api.get(`/videos/playlists?${params.toString()}`)
      .then((response) => {
        const data = Array.isArray(response.data.data) ? response.data.data : [];
        setPlaylists((prev) => [...prev, ...data]);
        setHasMore(data.length === 10);
        setPage(next);
      })
      .catch(() => {})
      .finally(() => { setLoadingMore(false); });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Video className="h-6 w-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">Vídeos</h1>
      </div>

      {/* Category filter chips */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              selectedCategory === null
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Todas
          </button>
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {playlists.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Nenhuma playlist encontrada.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {playlists.map((playlist: any) => (
            <Link key={playlist.id} to={`/videos/${playlist.id}`}>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {playlist.thumbnail && (
                  <img
                    src={playlist.thumbnail}
                    alt={playlist.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900">{playlist.title}</h2>
                  {playlist.description && (
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">{playlist.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <PlayCircle className="h-4 w-4 text-gray-400" />
                      <span>{playlist.items_count ?? 0} vídeos</span>
                    </div>
                    {playlist.category?.name && (
                      <div className="flex items-center gap-1">
                        <Tag className="h-4 w-4 text-gray-400" />
                        <span>{playlist.category.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full py-3 text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50"
            >
              {loadingMore ? (
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              ) : (
                'Carregar mais'
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
