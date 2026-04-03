import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/lib/api';
import { Ticket, Users, Trophy, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

export default function RaffleDetail() {
  const { id } = useParams();
  const [raffle, setRaffle] = useState<any>(null);
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchRaffle = async () => {
    try {
      const response = await api.get(`/raffles/${id}`);
      const data = response.data.data ?? response.data;
      setRaffle(data);

      if (data.status === 'drawn') {
        try {
          const winnersRes = await api.get(`/raffles/${id}/winners`);
          const winnersData = Array.isArray(winnersRes.data.data) ? winnersRes.data.data : [];
          setWinners(winnersData);
        } catch {
          setWinners([]);
        }
      }
    } catch {
      setRaffle(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRaffle();
  }, [id]);

  const handleParticipate = async () => {
    setActionLoading(true);
    setMessage('');
    try {
      await api.post(`/raffles/${id}/participate`);
      setMessage('Participação confirmada!');
      await fetchRaffle();
    } catch {
      setMessage('Erro ao participar do sorteio.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setActionLoading(true);
    setMessage('');
    try {
      await api.delete(`/raffles/${id}/participate`);
      setMessage('Participação cancelada.');
      await fetchRaffle();
    } catch {
      setMessage('Erro ao cancelar participação.');
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      open: 'bg-green-100 text-green-700',
      drawn: 'bg-blue-100 text-blue-700',
    };
    const labels: Record<string, string> = {
      open: 'Aberto',
      drawn: 'Sorteado',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-700'}`}>
        {labels[status] ?? status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!raffle) {
    return (
      <div>
        <Link to="/sorteios" className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Sorteio não encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link to="/sorteios" className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Ticket className="h-6 w-6 text-primary-500" />
            <h1 className="text-2xl font-bold text-gray-900">{raffle.title}</h1>
          </div>
          {raffle.status && statusBadge(raffle.status)}
        </div>

        {raffle.description && (
          <p className="text-sm text-gray-700 mb-6 whitespace-pre-line">{raffle.description}</p>
        )}

        <div className="space-y-2 text-sm text-gray-600 mb-6">
          {raffle.type && <p>Tipo: {raffle.type}</p>}
          {raffle.max_participants && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span>Máx. participantes: {raffle.max_participants}</span>
            </div>
          )}
          {raffle.parish?.name && <p>Paróquia: {raffle.parish.name}</p>}
          {raffle.event && (
            <p>Evento vinculado: {raffle.event.title ?? raffle.event.name}</p>
          )}
        </div>

        {raffle.prizes && raffle.prizes.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Prêmios</h2>
            <ul className="space-y-1">
              {raffle.prizes.map((prize: any, idx: number) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  {prize.name ?? prize.description ?? prize}
                </li>
              ))}
            </ul>
          </div>
        )}

        {message && (
          <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm">
            <CheckCircle className="h-4 w-4" />
            {message}
          </div>
        )}

        {raffle.status === 'open' && (
          <div className="flex gap-3">
            {raffle.is_participating ? (
              <button
                onClick={handleWithdraw}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Desistir
              </button>
            ) : (
              <button
                onClick={handleParticipate}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Participar
              </button>
            )}
          </div>
        )}

        {raffle.status === 'drawn' && winners.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Vencedores</h2>
            <div className="space-y-2">
              {winners.map((winner: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 bg-yellow-50 rounded-lg p-3">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span>{winner.user?.name ?? winner.name ?? `Vencedor ${idx + 1}`}</span>
                  {winner.prize && (
                    <span className="text-gray-500">- {winner.prize.name ?? winner.prize}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
