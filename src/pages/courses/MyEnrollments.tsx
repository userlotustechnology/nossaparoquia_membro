import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { BookCheck } from 'lucide-react';

export default function MyEnrollments() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.get('/courses/my?per_page=10')
      .then((response) => {
        if (cancelled) return;
        const data = Array.isArray(response.data.data) ? response.data.data : [];
        setEnrollments(data);
      })
      .catch(() => { if (!cancelled) setEnrollments([]); })
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
      <div className="flex items-center gap-3 mb-6">
        <BookCheck className="h-6 w-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">Meus Cursos</h1>
      </div>

      {enrollments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Você ainda não está inscrito em nenhum curso.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {enrollments.map((enrollment: any) => (
            <Link key={enrollment.id} to={`/meus-cursos/${enrollment.id}`}>
              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <h2 className="text-lg font-semibold text-gray-900">
                  {enrollment.course?.title ?? enrollment.title}
                </h2>
                <div className="mt-3 space-y-3">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-primary-500 h-2.5 rounded-full transition-all"
                      style={{ width: `${enrollment.progress_percentage ?? 0}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    Progresso: {enrollment.progress_percentage ?? 0}%
                  </p>
                  <div className="space-y-1 text-sm text-gray-600">
                    {enrollment.enrolled_at && (
                      <p>Inscrito em: {formatDate(enrollment.enrolled_at)}</p>
                    )}
                    {enrollment.completed_at && (
                      <p className="text-green-600 font-medium">
                        Concluído em: {formatDate(enrollment.completed_at)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
