import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Medal, ArrowLeft, Loader2 } from 'lucide-react';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [myPoints, setMyPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.get('/gamification/leaderboard')
      .then((response) => {
        if (cancelled) return;
        const data = response.data;
        setLeaderboard(Array.isArray(data.leaderboard) ? data.leaderboard : Array.isArray(data.data) ? data.data : []);
        setMyRank(data.my_rank ?? null);
        setMyPoints(data.my_points ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          setLeaderboard([]);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

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
        <Medal className="h-6 w-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">Ranking</h1>
      </div>

      {/* My Position */}
      {myRank != null && (
        <div className="bg-primary-50 rounded-xl border border-primary-200 p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-primary-600 font-medium">Sua Posição</p>
            <p className="text-2xl font-bold text-primary-700">#{myRank}</p>
          </div>
          {myPoints != null && (
            <div className="text-right">
              <p className="text-xs text-primary-600 font-medium">Seus Pontos</p>
              <p className="text-2xl font-bold text-primary-700">{myPoints}</p>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard */}
      {leaderboard.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Nenhum participante encontrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.slice(0, 10).map((entry: any, index: number) => {
            const rank = entry.rank ?? index + 1;
            const isMe = entry.is_current_user;
            return (
              <div
                key={entry.user_id ?? index}
                className={`flex items-center gap-4 rounded-xl border p-4 ${isMe ? 'bg-primary-50 border-primary-200' : 'bg-white border-gray-200'}`}
              >
                <span className={`w-8 text-center text-lg font-bold ${rank <= 3 ? 'text-yellow-500' : 'text-gray-400'}`}>
                  {rank}
                </span>
                {entry.avatar ? (
                  <img src={entry.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-500">
                    {(entry.name ?? '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isMe ? 'text-primary-700' : 'text-gray-900'}`}>
                    {entry.name}
                    {isMe && <span className="ml-1 text-xs text-primary-500">(Você)</span>}
                  </p>
                </div>
                <span className="text-sm font-bold text-gray-700">{entry.points} pts</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
