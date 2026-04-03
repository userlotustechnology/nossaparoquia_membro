import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Church,
  DollarSign,
  CalendarDays,
  ClipboardCheck,
  Bell,
  BookOpen,
  Heart,
  Sparkles,
  Calendar,
  Coins,
  Users,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import api from '@/lib/api';

interface Parish {
  id: number;
  name: string;
}

interface UpcomingEvent {
  id: number;
  title: string;
  starts_at: string;
  location: string;
}

interface DashboardData {
  user: { id: number; name: string };
  parishes_count: number;
  parishes: Parish[];
  tithes: { total: number; this_month: number };
  upcoming_events: UpcomingEvent[];
  pending_roster_confirmations: number;
  unread_notifications: number;
}

function formatCurrency(value: number): string {
  return 'R$ ' + value.toFixed(2).replace('.', ',');
}

function getFirstName(fullName: string): string {
  return fullName.split(' ')[0];
}

function getInitials(name: string): string {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (parts[0]?.[0] ?? '').toUpperCase();
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get<{ success: boolean; data: DashboardData }>('/dashboard');
        const d = response.data.data;
        setData({
          ...d,
          parishes: Array.isArray(d.parishes) ? d.parishes : [],
          upcoming_events: Array.isArray(d.upcoming_events) ? d.upcoming_events : [],
        });
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-24">
        <p className="text-sm text-gray-500">Erro ao carregar o painel. Tente novamente.</p>
      </div>
    );
  }

  const quickActions = [
    { label: 'Liturgia do Dia', icon: BookOpen, to: '/liturgia' },
    { label: 'Orações', icon: Heart, to: '/oracoes' },
    { label: 'Novenas', icon: Sparkles, to: '/novenas' },
    { label: 'Eventos', icon: Calendar, to: '/eventos' },
    { label: 'Dízimos', icon: Coins, to: '/dizimos' },
    { label: 'Comunidade', icon: Users, to: '/comunidade' },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold text-lg">
          {getInitials(data.user.name)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, {getFirstName(data.user.name)}!
          </h1>
          <p className="text-sm text-gray-500">Bem-vindo ao seu painel</p>
        </div>
      </div>

      {/* Parishes */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Church className="h-5 w-5 text-primary-500" />
          <h2 className="font-semibold text-gray-900">
            {data.parishes_count === 1 ? '1 paróquia vinculada' : `${data.parishes_count} paróquias vinculadas`}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.parishes.map((parish) => (
            <span
              key={parish.id}
              className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700"
            >
              {parish.name}
            </span>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Tithes Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-5 w-5 text-emerald-500" />
            <h2 className="font-semibold text-gray-900">Dízimos</h2>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.tithes.this_month)}</p>
            <p className="text-sm text-gray-500">este mês</p>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Total: <span className="font-medium text-gray-700">{formatCurrency(data.tithes.total)}</span>
            </p>
          </div>
        </div>

        {/* Pending Roster Confirmations */}
        <Link
          to="/escalas"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-primary-300 transition-colors"
        >
          <div className="flex items-center gap-2 mb-3">
            <ClipboardCheck className="h-5 w-5 text-amber-500" />
            <h2 className="font-semibold text-gray-900">Escalas</h2>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.pending_roster_confirmations}</p>
          <p className="text-sm text-gray-500">confirmações pendentes</p>
        </Link>

        {/* Unread Notifications */}
        <Link
          to="/notificacoes"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-primary-300 transition-colors"
        >
          <div className="flex items-center gap-2 mb-3">
            <Bell className="h-5 w-5 text-blue-500" />
            <h2 className="font-semibold text-gray-900">Notificações</h2>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.unread_notifications}</p>
          <p className="text-sm text-gray-500">não lidas</p>
        </Link>
      </div>

      {/* Upcoming Events */}
      {data.upcoming_events.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary-500" />
              <h2 className="font-semibold text-gray-900">Próximos Eventos</h2>
            </div>
            <Link to="/eventos" className="text-sm font-medium text-primary-600 hover:text-primary-700">
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {data.upcoming_events.slice(0, 3).map((event) => (
              <Link
                key={event.id}
                to={`/eventos/${event.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors -mx-1"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{event.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-500">
                      {new Date(event.starts_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="h-3.5 w-3.5" />
                        {event.location}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3">Acesso Rápido</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <action.icon className="h-6 w-6 text-primary-500" />
              <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
