import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, Clock, ChevronRight } from 'lucide-react';
import api from '@/lib/api';

interface Announcement {
  id: string;
  source_type: string;
  parish_name?: string;
  pastoral_name?: string;
  title: string;
  content: string;
  expires_at: string | null;
  created_at: string;
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await api.get<{ success: boolean; data: Announcement[] }>('/announcements');
        setAnnouncements(response.data.data);
      } catch {
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Megaphone className="h-6 w-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">Avisos</h1>
      </div>

      {!announcements || announcements.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Megaphone className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Nenhum aviso no momento</p>
          <p className="text-sm text-gray-400 mt-1">Quando houver avisos, eles aparecerão aqui.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => {
            const sourceName =
              announcement.source_type === 'parish'
                ? announcement.parish_name
                : announcement.pastoral_name;

            return (
              <Link
                key={announcement.id}
                to={`/avisos/${announcement.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-6 hover:border-primary-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-gray-900 mb-1">{announcement.title}</h2>

                    <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                      {announcement.content.replace(/<[^>]*>/g, '')}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      {sourceName && (
                        <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                          {sourceName}
                        </span>
                      )}

                      {announcement.expires_at && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                          <Clock className="h-3 w-3" />
                          Expira em {new Date(announcement.expires_at).toLocaleDateString('pt-BR')}
                        </span>
                      )}

                      <span className="text-xs text-gray-400">
                        {new Date(announcement.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
