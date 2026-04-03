import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/lib/api';
import { CalendarDays, MapPin, Users, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${id}`);
      setEvent(response.data.data ?? response.data);
    } catch {
      setEvent(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    setActionLoading(true);
    setMessage('');
    try {
      await api.post(`/events/${id}/register`);
      setMessage('Inscrição realizada com sucesso!');
      await fetchEvent();
    } catch {
      setMessage('Erro ao realizar inscrição.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    setMessage('');
    try {
      await api.post(`/events/${id}/check-in`);
      setMessage('Check-in realizado com sucesso!');
      await fetchEvent();
    } catch {
      setMessage('Erro ao realizar check-in.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!event) {
    return (
      <div>
        <Link to="/eventos" className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Evento não encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link to="/eventos" className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-primary-500" />
            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
          </div>
          <div className="flex gap-2">
            {event.is_public !== undefined && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${event.is_public ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {event.is_public ? 'Público' : 'Privado'}
              </span>
            )}
          </div>
        </div>

        {event.description && (
          <div
            className="prose prose-sm max-w-none text-gray-700 mb-6"
            dangerouslySetInnerHTML={{ __html: event.description }}
          />
        )}

        <div className="space-y-3 text-sm text-gray-600 mb-6">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-gray-400" />
            <span>Início: {formatDate(event.starts_at)}</span>
          </div>
          {event.ends_at && (
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              <span>Término: {formatDate(event.ends_at)}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{event.location}</span>
            </div>
          )}
          {event.parish?.name && (
            <p>Paróquia: {event.parish.name}</p>
          )}
          {event.parish?.pix_key && (
            <p>Chave Pix: {event.parish.pix_key}</p>
          )}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span>
              {event.registrations_count ?? 0} inscritos
              {event.max_participants ? ` / ${event.max_participants} vagas` : ''}
            </span>
          </div>
        </div>

        {message && (
          <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm">
            <CheckCircle className="h-4 w-4" />
            {message}
          </div>
        )}

        <div className="flex gap-3">
          {event.is_registered ? (
            <button
              onClick={handleCheckIn}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Fazer Check-in
            </button>
          ) : (
            <button
              onClick={handleRegister}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Inscrever-se
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
