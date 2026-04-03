import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Award, ArrowLeft } from 'lucide-react';

export default function Certificates() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.get('/courses/certificates?per_page=10')
      .then((response) => {
        if (cancelled) return;
        const data = Array.isArray(response.data.data) ? response.data.data : [];
        setCertificates(data);
      })
      .catch(() => { if (!cancelled) setCertificates([]); })
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
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div>
      <Link to="/cursos" className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Voltar para Cursos
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <Award className="h-6 w-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">Certificados</h1>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Nenhum certificado encontrado.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {certificates.map((cert: any) => (
            <div key={cert.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {cert.course?.title ?? cert.title}
                  </h2>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <p>Código: <span className="font-mono text-gray-800">{cert.certificate_code}</span></p>
                    {cert.issued_at && (
                      <p>Emitido em: {formatDate(cert.issued_at)}</p>
                    )}
                  </div>
                </div>
                <Award className="h-8 w-8 text-yellow-500 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
