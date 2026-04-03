import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Handshake, Loader2, Users } from 'lucide-react';
import api from '@/lib/api';

interface Pastoral {
  id: number;
  name: string;
  description: string | null;
  logo_url: string | null;
  parish: { id: number; name: string } | null;
  coordinator: { id: number; name: string } | null;
  my_status: 'approved' | 'pending' | null;
}

export default function Pastorals() {
  const [pastorals, setPastorals] = useState<Pastoral[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<number | null>(null);

  useEffect(() => {
    const fetchPastorals = async () => {
      try {
        setLoading(true);
        const response = await api.get('/pastorals');
        const data = Array.isArray(response.data.data) ? response.data.data : [];
        setPastorals(data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchPastorals();
  }, []);

  const handleJoin = async (e: React.MouseEvent, pastoralId: number) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setJoiningId(pastoralId);
      await api.post(`/pastorals/${pastoralId}/join`);
      setPastorals(prev =>
        prev.map(p => (p.id === pastoralId ? { ...p, my_status: 'pending' as const } : p))
      );
    } catch {
      // silent
    } finally {
      setJoiningId(null);
    }
  };

  const statusBadge = (status: Pastoral['my_status']) => {
    if (status === 'approved')
      return <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5">Membro</span>;
    if (status === 'pending')
      return <span className="text-xs bg-yellow-100 text-yellow-700 rounded-full px-2 py-0.5">Solicitado</span>;
    return null;
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Handshake className="h-6 w-6 text-primary-500" />
          <h1 className="text-2xl font-bold text-gray-900">Pastorais</h1>
        </div>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Handshake className="h-6 w-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">Pastorais</h1>
      </div>

      {pastorals.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Nenhuma pastoral encontrada.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pastorals.map(pastoral => (
            <Link
              key={pastoral.id}
              to={`/pastorais/${pastoral.id}`}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex items-center gap-3 mb-3">
                {pastoral.logo_url ? (
                  <img
                    src={pastoral.logo_url}
                    alt={pastoral.name}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">{pastoral.name}</h3>
                    {statusBadge(pastoral.my_status)}
                  </div>
                  {pastoral.parish && (
                    <p className="text-xs text-gray-500 truncate">{pastoral.parish.name}</p>
                  )}
                </div>
              </div>

              {pastoral.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{pastoral.description}</p>
              )}

              {pastoral.coordinator && (
                <p className="text-xs text-gray-500 mb-3">
                  Coordenador: {pastoral.coordinator.name}
                </p>
              )}

              {pastoral.my_status === null && (
                <button
                  onClick={e => handleJoin(e, pastoral.id)}
                  disabled={joiningId === pastoral.id}
                  className="mt-auto inline-flex items-center justify-center gap-1 px-3 py-1.5 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                >
                  {joiningId === pastoral.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Participar'
                  )}
                </button>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
