import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Handshake, ArrowLeft, Loader2, Users, Clock, Megaphone } from 'lucide-react';
import api from '@/lib/api';

interface Schedule {
  id: number;
  day: string;
  time: string;
}

interface Notice {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

interface PastoralMember {
  id: number;
  name: string;
  avatar_url: string | null;
}

interface PastoralData {
  id: number;
  name: string;
  description: string | null;
  logo_url: string | null;
  parish: { id: number; name: string } | null;
  coordinator: { id: number; name: string } | null;
  vice_coordinator: { id: number; name: string } | null;
  schedules: Schedule[];
  notices: Notice[];
  members: PastoralMember[];
  my_status: 'approved' | 'pending' | null;
}

export default function PastoralDetail() {
  const { id } = useParams();
  const [pastoral, setPastoral] = useState<PastoralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const fetchPastoral = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/pastorals/${id}`);
        setPastoral(response.data.data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchPastoral();
  }, [id]);

  const handleJoin = async () => {
    if (!pastoral) return;
    try {
      setJoining(true);
      await api.post(`/pastorals/${pastoral.id}/join`);
      setPastoral(prev => (prev ? { ...prev, my_status: 'pending' as const } : prev));
    } catch {
      // silent
    } finally {
      setJoining(false);
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!pastoral) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-sm text-gray-500">Pastoral não encontrada.</p>
      </div>
    );
  }

  const isMember = pastoral.my_status === 'approved';
  const schedules = Array.isArray(pastoral.schedules) ? pastoral.schedules : [];
  const notices = Array.isArray(pastoral.notices) ? pastoral.notices : [];
  const members = Array.isArray(pastoral.members) ? pastoral.members : [];

  return (
    <div>
      <Link
        to="/pastorais"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-center gap-4 mb-4">
          {pastoral.logo_url ? (
            <img
              src={pastoral.logo_url}
              alt={pastoral.name}
              className="h-16 w-16 rounded-xl object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
              <Handshake className="h-8 w-8" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pastoral.name}</h1>
            {pastoral.parish && (
              <p className="text-sm text-gray-500">{pastoral.parish.name}</p>
            )}
          </div>
        </div>

        {pastoral.description && (
          <p className="text-sm text-gray-700 mb-4">{pastoral.description}</p>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
          {pastoral.coordinator && (
            <div>
              <span className="font-medium">Coordenador:</span> {pastoral.coordinator.name}
            </div>
          )}
          {pastoral.vice_coordinator && (
            <div>
              <span className="font-medium">Vice-coordenador:</span> {pastoral.vice_coordinator.name}
            </div>
          )}
        </div>

        {pastoral.my_status === null && (
          <button
            onClick={handleJoin}
            disabled={joining}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 text-sm font-medium"
          >
            {joining ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Participar'
            )}
          </button>
        )}

        {pastoral.my_status === 'pending' && (
          <span className="inline-block text-sm bg-yellow-100 text-yellow-700 rounded-full px-3 py-1">
            Solicitação Pendente
          </span>
        )}

        {pastoral.my_status === 'approved' && (
          <span className="inline-block text-sm bg-green-100 text-green-700 rounded-full px-3 py-1">
            Membro
          </span>
        )}
      </div>

      {/* Schedules */}
      {schedules.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-800">Horários</h2>
          </div>
          <div className="space-y-2">
            {schedules.map(schedule => (
              <div key={schedule.id} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">{schedule.day}</span>
                <span>-</span>
                <span>{schedule.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notices (visible only to members) */}
      {isMember && notices.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Megaphone className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-800">Avisos</h2>
          </div>
          <div className="space-y-4">
            {notices.map(notice => (
              <div key={notice.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <h3 className="font-medium text-gray-900 text-sm">{notice.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{notice.content}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notice.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members (visible only to members) */}
      {isMember && members.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-800">Membros</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {members.map(member => (
              <div key={member.id} className="flex items-center gap-3">
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt={member.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-semibold">
                    {getInitials(member.name)}
                  </div>
                )}
                <span className="text-sm text-gray-700">{member.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
