import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Megaphone, ArrowLeft, Clock } from 'lucide-react';
import api from '@/lib/api';

interface AnnouncementData {
  id: number;
  parish_name: string;
  title: string;
  content: string;
  expires_at: string | null;
}

export default function AnnouncementDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<AnnouncementData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const response = await api.get<{ success: boolean; data: AnnouncementData }>(
          `/announcements/${id}`,
        );
        setData(response.data.data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [id]);

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
        <Megaphone className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">Aviso não encontrado</p>
        <Link
          to="/avisos"
          className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para avisos
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/avisos"
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para avisos
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {data.parish_name && (
            <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
              {data.parish_name}
            </span>
          )}

          {data.expires_at && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
              <Clock className="h-3.5 w-3.5" />
              Expira em {new Date(data.expires_at).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">{data.title}</h1>

        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: data.content }}
        />
      </div>
    </div>
  );
}
