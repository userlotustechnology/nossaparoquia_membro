import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Gift, ArrowLeft, Loader2, Star } from 'lucide-react';

export default function Prizes() {
  const [prizes, setPrizes] = useState<any[]>([]);
  const [myPrizes, setMyPrizes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get('/gamification/prizes'),
      api.get('/gamification/my-prizes'),
    ])
      .then(([prizesRes, myPrizesRes]) => {
        if (cancelled) return;
        setPrizes(Array.isArray(prizesRes.data.data) ? prizesRes.data.data : Array.isArray(prizesRes.data) ? prizesRes.data : []);
        setMyPrizes(Array.isArray(myPrizesRes.data.data) ? myPrizesRes.data.data : Array.isArray(myPrizesRes.data) ? myPrizesRes.data : []);
      })
      .catch(() => {
        if (!cancelled) {
          setPrizes([]);
          setMyPrizes([]);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const formatDate = (date: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
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
        <Link to="/gamificacao" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Gift className="h-6 w-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">Prêmios</h1>
      </div>

      {/* Available Prizes */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Prêmios Disponíveis</h2>
        {prizes.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Nenhum prêmio disponível no momento.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {prizes.map((prize: any) => (
              <div key={prize.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{prize.name}</h3>
                    {prize.description && (
                      <p className="text-sm text-gray-500 mt-1">{prize.description}</p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-yellow-500" />
                    <span className="font-medium text-gray-700">{prize.min_points} pontos</span>
                  </div>
                  {prize.level && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-medium">
                      Nível: {prize.level}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Prizes */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Meus Prêmios</h2>
        {myPrizes.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Você ainda não resgatou nenhum prêmio.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myPrizes.map((item: any) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">{item.prize?.name ?? item.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {item.status === 'delivered' ? 'Entregue' : 'Pendente'}
                  </span>
                </div>
                {item.awarded_at && (
                  <p className="text-xs text-gray-500 mt-2">Concedido em: {formatDate(item.awarded_at)}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
