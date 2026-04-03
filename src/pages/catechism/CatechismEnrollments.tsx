import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { BookOpenCheck, Users, User, CalendarDays, Church, CheckCircle, XCircle, Clock, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

export default function CatechismEnrollments() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [parishioners, setParishioners] = useState<any[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [enrollingGroupId, setEnrollingGroupId] = useState<number | null>(null);
  const [selectedParishionerId, setSelectedParishionerId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;
    api.get('/catechism/enrollments')
      .then((response) => {
        if (cancelled) return;
        const data = Array.isArray(response.data.data) ? response.data.data : [];
        setEnrollments(data);
      })
      .catch(() => { if (!cancelled) setEnrollments([]); })
      .finally(() => { if (!cancelled) setLoadingEnrollments(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    api.get('/catechism/groups')
      .then((response) => {
        if (cancelled) return;
        const data = Array.isArray(response.data.data) ? response.data.data : [];
        setGroups(data);
      })
      .catch(() => { if (!cancelled) setGroups([]); })
      .finally(() => { if (!cancelled) setLoadingGroups(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    api.get('/parishioners/dependents')
      .then((response) => {
        if (cancelled) return;
        const data = Array.isArray(response.data.data) ? response.data.data : [];
        setParishioners(data);
      })
      .catch(() => { if (!cancelled) setParishioners([]); });
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

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string; icon: any }> = {
      pending: { label: 'Pendente', cls: 'bg-yellow-100 text-yellow-700', icon: Clock },
      confirmed: { label: 'Confirmado', cls: 'bg-green-100 text-green-700', icon: CheckCircle },
      cancelled: { label: 'Cancelado', cls: 'bg-red-100 text-red-700', icon: XCircle },
    };
    return map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-700', icon: Clock };
  };

  const groupStatusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      open: { label: 'Aberta', cls: 'bg-green-100 text-green-700' },
      closed: { label: 'Fechada', cls: 'bg-red-100 text-red-700' },
    };
    return map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-700' };
  };

  const handleEnroll = () => {
    if (!enrollingGroupId || !selectedParishionerId) return;
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');
    api.post('/catechism/enrollments', {
      group_id: enrollingGroupId,
      parishioner_id: Number(selectedParishionerId),
    })
      .then((response) => {
        setSubmitSuccess('Inscrição realizada com sucesso!');
        setEnrollingGroupId(null);
        setSelectedParishionerId('');
        const newEnrollment = response.data.data;
        if (newEnrollment) {
          setEnrollments((prev) => [...prev, newEnrollment]);
        }
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || 'Erro ao realizar inscrição.';
        setSubmitError(msg);
      })
      .finally(() => { setSubmitting(false); });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <BookOpenCheck className="h-6 w-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">Catequese</h1>
      </div>

      {/* Minhas Inscrições */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Minhas Inscrições</h2>

      {loadingEnrollments ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : enrollments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <p className="text-sm text-gray-500">Nenhuma inscrição na catequese encontrada.</p>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {enrollments.map((enrollment: any) => {
            const badge = statusBadge(enrollment.status);
            const BadgeIcon = badge.icon;
            return (
              <div key={enrollment.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <h3 className="text-base font-semibold text-gray-900">
                    {enrollment.group?.name ?? 'Turma'}
                  </h3>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}>
                    <BadgeIcon className="h-3.5 w-3.5" />
                    {badge.label}
                  </span>
                </div>
                <div className="mt-3 space-y-2 text-sm text-gray-600">
                  {enrollment.parishioner?.name && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>Catequizando: {enrollment.parishioner.name}</span>
                    </div>
                  )}
                  {enrollment.group?.catechists && enrollment.group.catechists.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>Catequistas: {enrollment.group.catechists.map((c: any) => c.name).join(', ')}</span>
                    </div>
                  )}
                  {enrollment.enrolled_at && (
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-gray-400" />
                      <span>Inscrito em: {formatDate(enrollment.enrolled_at)}</span>
                    </div>
                  )}
                  {enrollment.status === 'confirmed' && enrollment.attendance_summary && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                      <p className="font-medium text-gray-700 mb-1">Frequência</p>
                      <div className="flex gap-4 text-gray-600">
                        <span>Presenças: {enrollment.attendance_summary.present ?? 0}</span>
                        <span>Faltas: {enrollment.attendance_summary.absent ?? 0}</span>
                        {enrollment.attendance_summary.total != null && (
                          <span>Total: {enrollment.attendance_summary.total}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Turmas Disponíveis */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Turmas Disponíveis</h2>

      {submitSuccess && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm font-medium">
          {submitSuccess}
        </div>
      )}

      {loadingGroups ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Nenhuma turma disponível no momento.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group: any) => {
            const gBadge = groupStatusBadge(group.status);
            const isOpen = group.status === 'open';
            const isFormOpen = enrollingGroupId === group.id;
            return (
              <div key={group.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <h3 className="text-base font-semibold text-gray-900">{group.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${gBadge.cls}`}>
                    {gBadge.label}
                  </span>
                </div>
                <div className="mt-3 space-y-2 text-sm text-gray-600">
                  {group.parish?.name && (
                    <div className="flex items-center gap-2">
                      <Church className="h-4 w-4 text-gray-400" />
                      <span>{group.parish.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>{group.confirmed_count ?? 0} / {group.capacity ?? '–'} vagas</span>
                  </div>
                  {group.catechists && group.catechists.length > 0 && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>Catequistas: {group.catechists.map((c: any) => c.name).join(', ')}</span>
                    </div>
                  )}
                </div>

                {isOpen && (
                  <div className="mt-4">
                    {!isFormOpen ? (
                      <button
                        onClick={() => { setEnrollingGroupId(group.id); setSubmitError(''); setSubmitSuccess(''); }}
                        className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                      >
                        Inscrever Dependente
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    ) : (
                      <div className="mt-2 p-4 bg-gray-50 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-700">Selecionar dependente</p>
                          <button
                            onClick={() => { setEnrollingGroupId(null); setSubmitError(''); }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                        </div>
                        <select
                          value={selectedParishionerId}
                          onChange={(e) => setSelectedParishionerId(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="">Selecione...</option>
                          {parishioners.map((p: any) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                        {submitError && (
                          <p className="text-sm text-red-600">{submitError}</p>
                        )}
                        <button
                          onClick={handleEnroll}
                          disabled={submitting || !selectedParishionerId}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-50"
                        >
                          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                          Confirmar Inscrição
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
