import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/lib/api';
import { ListVideo, ArrowLeft, Play, Clock, Tag, ExternalLink } from 'lucide-react';

export default function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.get(`/videos/playlists/${id}`)
      .then((response) => {
        if (cancelled) return;
        setPlaylist(response.data.data ?? response.data);
      })
      .catch(() => { if (!cancelled) setPlaylist(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return null;
  };

  const formatDuration = (seconds: number | string | null) => {
    if (!seconds) return '';
    const total = typeof seconds === 'string' ? parseInt(seconds, 10) : seconds;
    if (isNaN(total)) return '';
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="text-center py-24">
        <ListVideo className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">Playlist não encontrada</p>
        <Link
          to="/videos"
          className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para vídeos
        </Link>
      </div>
    );
  }

  const items: any[] = Array.isArray(playlist.items) ? playlist.items : [];

  return (
    <div>
      <Link
        to="/videos"
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para vídeos
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {playlist.category?.name && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
              <Tag className="h-3.5 w-3.5" />
              {playlist.category.name}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{playlist.title}</h1>
        {playlist.description && (
          <p className="text-sm text-gray-600">{playlist.description}</p>
        )}
      </div>

      {/* Embedded player */}
      {activeVideoUrl && (
        <div className="mb-6">
          {getEmbedUrl(activeVideoUrl) ? (
            <div className="aspect-video rounded-xl overflow-hidden border border-gray-200">
              <iframe
                src={getEmbedUrl(activeVideoUrl)!}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Video player"
              />
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
              <a
                href={activeVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir vídeo em nova aba
              </a>
            </div>
          )}
        </div>
      )}

      {/* Video list */}
      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Nenhum vídeo nesta playlist.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item: any, index: number) => {
            const isActive = activeVideoUrl === item.video_url;
            return (
              <button
                key={item.id ?? index}
                onClick={() => {
                  if (item.video_url) {
                    const embedUrl = getEmbedUrl(item.video_url);
                    if (embedUrl) {
                      setActiveVideoUrl(item.video_url);
                    } else {
                      window.open(item.video_url, '_blank', 'noopener,noreferrer');
                    }
                  }
                }}
                className={`w-full text-left bg-white rounded-xl border p-4 hover:shadow-md transition-shadow ${
                  isActive ? 'border-primary-400 ring-1 ring-primary-200' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <Play className={`h-5 w-5 ${isActive ? 'text-primary-500' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`text-sm font-semibold ${isActive ? 'text-primary-700' : 'text-gray-900'}`}>
                        {item.title}
                      </h3>
                      {item.duration != null && (
                        <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDuration(item.duration)}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
