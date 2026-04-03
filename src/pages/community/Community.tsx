import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface Member {
  id: number;
  name: string;
  avatar_url: string | null;
  spiritual_gifts: { id: number; name: string }[];
  parishes: { id: number; name: string }[];
}

export default function Community() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchMembers = async (pageNum: number, query: string, append = false) => {
    try {
      if (append) setLoadingMore(true); else setLoading(true);
      const params: Record<string, string | number> = { per_page: 15, page: pageNum };
      if (query) params.q = query;
      const response = await api.get('/community/members', { params });
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setMembers(prev => append ? [...prev, ...data] : data);
      setHasMore(data.length === 15);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchMembers(1, search);
  }, [search]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchMembers(next, search, true);
  };

  const getInitials = (name: string) =>
    name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-6 w-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">Comunidade</h1>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar membros..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Nenhum membro encontrado.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {members.map(member => (
              <Link
                key={member.id}
                to={`/comunidade/${member.id}`}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 mb-3">
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt={member.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold text-sm">
                      {getInitials(member.name)}
                    </div>
                  )}
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                </div>

                {Array.isArray(member.spiritual_gifts) && member.spiritual_gifts.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {member.spiritual_gifts.map(gift => (
                      <span
                        key={gift.id}
                        className="inline-block text-xs bg-primary-50 text-primary-700 rounded-full px-2 py-0.5"
                      >
                        {gift.name}
                      </span>
                    ))}
                  </div>
                )}

                {Array.isArray(member.parishes) && member.parishes.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {member.parishes.map(parish => (
                      <span
                        key={parish.id}
                        className="inline-block text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5"
                      >
                        {parish.name}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 text-sm font-medium"
              >
                {loadingMore ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
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
