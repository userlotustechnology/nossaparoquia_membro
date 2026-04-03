import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/lib/api';
import { HeartHandshake, CalendarDays, ArrowLeft, Loader2 } from 'lucide-react';

export default function CampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await api.get(`/campaigns/${id}`);
        setCampaign(response.data.data ?? response.data);
      } catch {
        setCampaign(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [id]);

  const formatDate = (date: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div>
        <Link to="/campanhas" className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Campanha não encontrada.</p>
        </div>
      </div>
    );
  }

  const percent = campaign.progress_percent ?? 0;

  return (
    <div>
      <Link to="/campanhas" className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <HeartHandshake className="h-6 w-6 text-primary-500" />
            <h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
          </div>
          {campaign.is_active !== undefined && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${campaign.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              {campaign.is_active ? 'Ativa' : 'Encerrada'}
            </span>
          )}
        </div>

        {campaign.description && (
          <p className="text-sm text-gray-700 mb-6 whitespace-pre-line">{campaign.description}</p>
        )}

        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">
              {formatCurrency(campaign.collected_amount)} arrecadados
            </span>
            <span className="font-medium text-primary-600">{percent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary-500 h-3 rounded-full transition-all"
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Meta: {formatCurrency(campaign.goal_amount)}
          </p>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          {campaign.deadline && (
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              <span>Prazo: {formatDate(campaign.deadline)}</span>
            </div>
          )}
          {campaign.parish?.name && (
            <p>Paróquia: {campaign.parish.name}</p>
          )}
        </div>
      </div>
    </div>
  );
}
