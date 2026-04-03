import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, UserPlus, Check } from 'lucide-react';
import api from '@/lib/api';

interface MemberData {
  id: number;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  spiritual_gifts: { id: number; name: string }[];
  parishes: { id: number; name: string }[];
}

export default function MemberProfile() {
  const { id } = useParams();
  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/community/members/${id}`);
        setMember(response.data.data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [id]);

  const handleConnect = async () => {
    if (!member) return;
    try {
      setSending(true);
      await api.post('/connections', { user_id: member.id });
      setSent(true);
    } catch {
      // silent
    } finally {
      setSending(false);
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

  if (!member) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-sm text-gray-500">Membro não encontrado.</p>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/comunidade"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          {member.avatar_url ? (
            <img
              src={member.avatar_url}
              alt={member.name}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xl">
              {getInitials(member.name)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{member.name}</h1>
            {member.bio && (
              <p className="text-sm text-gray-600 mt-1">{member.bio}</p>
            )}
          </div>
        </div>

        {Array.isArray(member.spiritual_gifts) && member.spiritual_gifts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Dons Espirituais</h2>
            <div className="flex flex-wrap gap-2">
              {member.spiritual_gifts.map(gift => (
                <span
                  key={gift.id}
                  className="inline-block text-sm bg-primary-50 text-primary-700 rounded-full px-3 py-1"
                >
                  {gift.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {Array.isArray(member.parishes) && member.parishes.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Paróquias</h2>
            <div className="flex flex-wrap gap-2">
              {member.parishes.map(parish => (
                <span
                  key={parish.id}
                  className="inline-block text-sm bg-gray-100 text-gray-600 rounded-full px-3 py-1"
                >
                  {parish.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleConnect}
          disabled={sending || sent}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 text-sm font-medium"
        >
          {sent ? (
            <>
              <Check className="h-4 w-4" />
              Solicitação Enviada
            </>
          ) : sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Conectar
            </>
          )}
        </button>
      </div>
    </div>
  );
}
