import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BookHeart, Search, Users, Calendar, ChevronRight, BookMarked } from 'lucide-react';
import api from '@/lib/api';

interface Novena {
  id: number;
  title: string;
  description: string;
  saint: string;
  image_url: string | null;
  total_days: number;
  participants_count: number;
  user_status: 'active' | 'completed' | null;
}

interface Meta {
  current_page: number;
  last_page: number;
}

export default function Novenas() {
  const [novenas, setNovenas] = useState<Novena[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const fetchNovenas = useCallback(async (page: number, query: string, append: boolean) => {
    if (page === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const params: Record<string, string | number> = { per_page: 10, page };
      if (query.trim()) params.q = query.trim();

      const response = await api.get<{ data: Novena[]; meta: Meta }>('/novenas', { params });
      const data = response.data.data;
      const metaData = response.data.meta;

      setNovenas((prev) => (append ? [...prev, ...data] : data));
      setMeta(metaData);
    } catch {
      if (!append) setNovenas([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchNovenas(1, search, false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      fetchNovenas(1, value, false);
    }, 400);
    setSearchTimeout(timeout);
  };

  const handleLoadMore = () => {
    if (meta && meta.current_page < meta.last_page) {
      fetchNovenas(meta.current_page + 1, search, true);
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookHeart className="h-6 w-6 text-primary-500" />
          <h1 className="text-2xl font-bold text-gray-900">Novenas</h1>
        </div>
        <Link
          to="/minhas-novenas"
          className="inline-flex items-center gap-2 rounded-lg bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100 transition-colors"
        >
          <BookMarked className="h-4 w-4" />
          Minhas Novenas
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar novenas..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-1 focus:ring-primary-300"
        />
      </div>

      {novenas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <BookHeart className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Nenhuma novena encontrada</p>
          <p className="text-sm text-gray-400 mt-1">Tente ajustar sua busca ou volte mais tarde.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {novenas.map((novena) => (
              <Link
                key={novena.id}
                to={`/novenas/${novena.id}`}
                className="block bg-white rounded-xl border border-gray-200 hover:border-primary-300 transition-colors overflow-hidden"
              >
                <div className="flex">
                  {novena.image_url && (
                    <div className="w-28 sm:w-36 flex-shrink-0">
                      <img
                        src={novena.image_url}
                        alt={novena.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h2 className="font-semibold text-gray-900">{novena.title}</h2>
                          {novena.user_status === 'active' && (
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                              Em andamento
                            </span>
                          )}
                          {novena.user_status === 'completed' && (
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                              Concluída
                            </span>
                          )}
                        </div>
                        {novena.saint && (
                          <p className="text-sm text-primary-600 font-medium mb-1">{novena.saint}</p>
                        )}
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {novena.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {novena.total_days} dias
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {novena.participants_count} participantes
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {meta && meta.current_page < meta.last_page && (
            <div className="mt-6 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500" />
                    Carregando...
                  </>
                ) : (
                  'Carregar mais'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
