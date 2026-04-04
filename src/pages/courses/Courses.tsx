import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { GraduationCap, Users, Tag, BarChart3, User } from 'lucide-react';

export default function Courses() {
  const [tab, setTab] = useState<'available' | 'my'>('available');
  const [courses, setCourses] = useState<any[]>([]);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMy, setLoadingMy] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.get('/courses?per_page=10')
      .then((response) => {
        if (cancelled) return;
        const data = Array.isArray(response.data.data) ? response.data.data : [];
        setCourses(data);
      })
      .catch(() => { if (!cancelled) setCourses([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    api.get('/courses/my?per_page=10')
      .then((response) => {
        if (cancelled) return;
        const data = Array.isArray(response.data.data) ? response.data.data : [];
        setMyCourses(data);
      })
      .catch(() => { if (!cancelled) setMyCourses([]); })
      .finally(() => { if (!cancelled) setLoadingMy(false); });
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

  const formatPrice = (value: number) => {
    return 'R$ ' + value.toFixed(2).replace('.', ',');
  };

  const paymentStatusLabel = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      paid: { label: 'Pago', cls: 'bg-green-100 text-green-700' },
      pending: { label: 'Pendente', cls: 'bg-yellow-100 text-yellow-700' },
      free: { label: 'Gratuito', cls: 'bg-blue-100 text-blue-700' },
    };
    return map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-700' };
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <GraduationCap className="h-6 w-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">Cursos</h1>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('available')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === 'available' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
        >
          Disponíveis
        </button>
        <button
          onClick={() => setTab('my')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === 'my' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
        >
          Meus Cursos
        </button>
      </div>

      {tab === 'available' && (
        <>
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm text-gray-500">Nenhum curso disponível no momento.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course: any) => (
                <Link key={course.id} to={`/cursos/${course.slug}`}>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                      <div className="h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {course.thumbnail_url ? (
                          <img
                            src={course.thumbnail_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <GraduationCap className="h-10 w-10 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h2 className="text-lg font-semibold text-gray-900">{course.title}</h2>
                          {course.is_free ? (
                            <span className="inline-flex shrink-0 items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              Gratuito
                            </span>
                          ) : (
                            <span className="shrink-0 text-sm font-semibold text-gray-900">
                              {formatPrice(course.price ?? 0)}
                            </span>
                          )}
                        </div>
                        <div className="mt-3 space-y-2 text-sm text-gray-600">
                          {(course.category_label || course.category) && (
                            <div className="flex items-center gap-2">
                              <Tag className="h-4 w-4 text-gray-400" />
                              <span>{course.category_label ?? course.category}</span>
                            </div>
                          )}
                          {(course.level_label || course.level) && (
                            <div className="flex items-center gap-2">
                              <BarChart3 className="h-4 w-4 text-gray-400" />
                              <span>{course.level_label ?? course.level}</span>
                            </div>
                          )}
                          {course.instructor_name && (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span>{course.instructor_name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{course.enrolled_count ?? course.enrollments_count ?? 0} inscritos</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'my' && (
        <>
          {loadingMy ? (
            <div className="flex justify-center py-24">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
            </div>
          ) : myCourses.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm text-gray-500">Você ainda não está inscrito em nenhum curso.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myCourses.map((enrollment: any) => (
                <Link key={enrollment.id} to={`/meus-cursos/${enrollment.id}`}>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                      <div className="h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {enrollment.course?.thumbnail_url ? (
                          <img
                            src={enrollment.course.thumbnail_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <GraduationCap className="h-10 w-10 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h2 className="text-lg font-semibold text-gray-900">
                            {enrollment.course?.title ?? enrollment.title}
                          </h2>
                          {enrollment.payment_status && (
                            <span className={`inline-flex shrink-0 items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentStatusLabel(enrollment.payment_status).cls}`}>
                              {paymentStatusLabel(enrollment.payment_status).label}
                            </span>
                          )}
                        </div>
                        <div className="mt-3 space-y-2 text-sm text-gray-600">
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
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
