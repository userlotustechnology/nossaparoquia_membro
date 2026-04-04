import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/lib/api';
import { BookCheck, ArrowLeft, ChevronDown, ChevronUp, CheckCircle, Circle, Loader2 } from 'lucide-react';

export default function EnrollmentDetail() {
  const { enrollmentUuid } = useParams<{ enrollmentUuid: string }>();
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completingLesson, setCompletingLesson] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [openModules, setOpenModules] = useState<Record<number, boolean>>({});

  const fetchEnrollment = () => {
    return api.get(`/courses/my/${enrollmentUuid}`)
      .then((response) => {
        setEnrollment(response.data.data ?? response.data);
      })
      .catch(() => {
        setEnrollment(null);
      });
  };

  useEffect(() => {
    let cancelled = false;
    api.get(`/courses/my/${enrollmentUuid}`)
      .then((response) => {
        if (cancelled) return;
        setEnrollment(response.data.data ?? response.data);
      })
      .catch(() => { if (!cancelled) setEnrollment(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [enrollmentUuid]);

  const handleCompleteLesson = async (lessonId: number) => {
    setCompletingLesson(lessonId);
    setMessage('');
    try {
      await api.post(`/courses/lessons/${lessonId}/complete`);
      setMessage('Lição concluída com sucesso!');
      await fetchEnrollment();
    } catch {
      setMessage('Erro ao concluir lição.');
    } finally {
      setCompletingLesson(null);
    }
  };

  const toggleModule = (moduleId: number) => {
    setOpenModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div>
        <Link to="/meus-cursos" className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Matrícula não encontrada.</p>
        </div>
      </div>
    );
  }

  const course = enrollment.course ?? enrollment;
  const modules = Array.isArray(course.modules) ? course.modules : [];
  const progress = enrollment.progress_percentage ?? 0;

  return (
    <div>
      <Link to="/meus-cursos" className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <BookCheck className="h-6 w-6 text-primary-500" />
          <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progresso</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary-500 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {message && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-700 text-sm">
            <CheckCircle className="h-4 w-4" />
            {message}
          </div>
        )}
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
                    <ul className="mt-3 space-y-3">
                      {mod.lessons.map((lesson: any) => (
                        <li key={lesson.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            {lesson.completed ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Circle className="h-4 w-4 text-gray-400" />
                            )}
                            <span className={lesson.completed ? 'line-through text-gray-400' : ''}>
                              {lesson.title}
                            </span>
                          </div>
                          {!lesson.completed && (
                            <button
                              onClick={() => handleCompleteLesson(lesson.id)}
                              disabled={completingLesson === lesson.id}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-primary-600 border border-primary-300 rounded-lg hover:bg-primary-50 disabled:opacity-50"
                            >
                              {completingLesson === lesson.id && (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              )}
                              Concluir Lição
                            </button>
                          )}
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
