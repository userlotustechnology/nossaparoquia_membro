import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Trophy, Medal, Gift, History, Star, Loader2, ChevronRight } from 'lucide-react';

export default function Gamification() {
  const [profile, setProfile] = useState<any>(null);
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get('/gamification/me'),
      api.get('/gamification/actions'),
    ])
      .then(([profileRes, actionsRes]) => {
        if (cancelled) return;
        setProfile(profileRes.data);
        setActions(Array.isArray(actionsRes.data.data) ? actionsRes.data.data : Array.isArray(actionsRes.data) ? actionsRes.data : []);
      })
      .catch(() => {
        if (!cancelled) {
          setProfile(null);
          setActions([]);
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
        <Trophy className="h-6 w-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">Gamificação</h1>
      </div>

      {profile ? (
        <>
          {/* Points & Level */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 text-center">
            <p className="text-4xl font-bold text-primary-600">{profile.total_points ?? 0}</p>
            <p className="text-sm text-gray-500 mt-1">pontos</p>

            {profile.current_level_name && (
              <p className="mt-3 text-sm font-medium text-gray-700">
                Nível: <span className="text-primary-600">{profile.current_level_name}</span>
              </p>
            )}

            {profile.progress_to_next != null && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Progresso para o próximo nível</span>
                  <span className="font-medium text-primary-600">{profile.progress_to_next}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-primary-500 h-2.5 rounded-full transition-all"
                    style={{ width: `${Math.min(profile.progress_to_next ?? 0, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {profile.earned_today != null && (
              <p className="mt-3 text-xs text-gray-500">
                Ganhos hoje: <span className="font-medium text-green-600">+{profile.earned_today}</span>
              </p>
            )}
          </div>

          {/* Navigation Links */}
          <div className="space-y-2 mb-6">
            <Link to="/gamificacao/ranking" className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <Medal className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-900">Ranking</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Link>
            <Link to="/gamificacao/premios" className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <Gift className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-900">Prêmios</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Link>
            <Link to="/gamificacao/historico" className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <History className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-900">Histórico de Pontos</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Link>
          </div>

          {/* Available Actions */}
          {actions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Ações Disponíveis</h2>
              <div className="space-y-2">
                {actions.map((action: any) => (
                  <div key={action.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{action.name}</p>
                        {action.description && (
                          <p className="text-xs text-gray-500">{action.description}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-bold text-green-600">+{action.points}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Não foi possível carregar os dados de gamificação.</p>
        </div>
      )}
    </div>
  );
}
