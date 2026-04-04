import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/lib/api';
import { GraduationCap, ArrowLeft, User, ChevronDown, ChevronUp, BookOpen, Loader2, CheckCircle } from 'lucide-react';

export default function CourseDetail() {
  const { slug } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [message, setMessage] = useState('');
  const [openModules, setOpenModules] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    api.get(`/courses/${slug}`)
      .then((response) => {
        if (cancelled) return;
        setCourse(response.data.data ?? response.data);
      })
      .catch(() => { if (!cancelled) setCourse(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  const handleEnroll = async () => {
    if (!course) return;
    if (!course.uuid) {
      setMessage('Não foi possível identificar o curso. Atualize a página.');
      return;
    }
    setEnrolling(true);
    setMessage('');
    try {
      await api.post(`/courses/${course.uuid}/enroll`);
      setMessage('Inscrição realizada com sucesso!');
    } catch {
      setMessage('Erro ao realizar inscrição.');
    } finally {
      setEnrolling(false);
    }
  };

  const toggleModule = (moduleId: number) => {
    setOpenModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const formatPrice = (value: number) => {
    return 'R$ ' + value.toFixed(2).replace('.', ',');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!course) {
    return (
      <div>
        <Link to="/cursos" className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Curso não encontrado.</p>
        </div>
      </div>
    );
  }

  const modules = Array.isArray(course.modules) ? course.modules : [];

  return (
    <div>
      <Link to="/cursos" className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
        {course.thumbnail_url ? (
          <div className="aspect-[21/9] max-h-56 w-full bg-gray-100">
            <img
              src={course.thumbnail_url}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}
        <div className="p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <GraduationCap className="h-6 w-6 shrink-0 text-primary-500" />
              <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
            </div>
            {course.is_free ? (
              <span className="inline-flex shrink-0 items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                Gratuito
              </span>
            ) : (
              <span className="shrink-0 text-lg font-semibold text-gray-900">
                {formatPrice(course.price ?? 0)}
              </span>
            )}
          </div>

        {course.description && (
          <div
            className="prose prose-sm max-w-none text-gray-700 mb-6"
            dangerouslySetInnerHTML={{ __html: course.description }}
          />
        )}

        {course.instructor_name && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
            <User className="h-4 w-4 text-gray-400" />
            <span>Instrutor: {course.instructor_name}</span>
          </div>
        )}

        {message && (
          <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm">
            <CheckCircle className="h-4 w-4" />
            {message}
          </div>
        )}

        <button
          onClick={handleEnroll}
          disabled={enrolling}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {enrolling && <Loader2 className="h-4 w-4 animate-spin" />}
          Inscrever-se
        </button>
        </div>
      </div>

      {modules.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Módulos</h2>
          {modules.map((mod: any) => (
            <div key={mod.id} className="bg-white rounded-xl border border-gray-200">
              <button
                onClick={() => toggleModule(mod.id)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="font-medium text-gray-900">{mod.title}</span>
                {openModules[mod.id] ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {openModules[mod.id] && (
                <div className="border-t border-gray-200 px-4 pb-4">
                  {Array.isArray(mod.lessons) && mod.lessons.length > 0 ? (
                    <ul className="mt-3 space-y-2">
                      {mod.lessons.map((lesson: any) => (
                        <li key={lesson.id} className="flex items-center gap-2 text-sm text-gray-600">
                          <BookOpen className="h-4 w-4 text-gray-400" />
                          <span>{lesson.title}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-gray-500">Nenhuma lição neste módulo.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
