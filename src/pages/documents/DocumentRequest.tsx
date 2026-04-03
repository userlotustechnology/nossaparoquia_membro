import { useState, useEffect } from 'react';
import { FileText, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '@/lib/api';

export default function DocumentRequest() {
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/documents/types')
      .then((res) => {
        const data = res.data.data ?? res.data;
        setTypes(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setTypes([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  function handleSelect(type: any) {
    setSelected(type);
    setFormData({});
    setSuccess(false);
  }

  function handleFieldChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    api.post('/documents/request', {
      document_type_id: selected.id,
      request_data: formData,
    })
      .then(() => {
        setSuccess(true);
        setFormData({});
      })
      .catch(() => {})
      .finally(() => {
        setSubmitting(false);
      });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (selected) {
    const requiredFields: string[] = Array.isArray(selected.required_fields) ? selected.required_fields : [];

    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <FileText className="h-6 w-6 text-primary-500" />
          <h1 className="text-2xl font-bold text-gray-900">{selected.name}</h1>
        </div>

        {success ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Solicitacao enviada com sucesso!</h2>
            <p className="text-sm text-gray-500 mb-4">Voce pode acompanhar o status em Meus Documentos.</p>
            <button
              onClick={() => { setSelected(null); setSuccess(false); }}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Voltar
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {selected.description && (
              <p className="text-sm text-gray-600 mb-4">{selected.description}</p>
            )}
            {selected.fee != null && (
              <p className="text-sm font-medium text-gray-700 mb-4">
                Taxa: <span className="text-primary-600">R$ {Number(selected.fee).toFixed(2)}</span>
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {requiredFields.map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {field.replace(/_/g, ' ')}
                  </label>
                  <input
                    type="text"
                    value={formData[field] ?? ''}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ))}
              <button
                type="submit"
                disabled={submitting}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Enviando...' : 'Solicitar Documento'}
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-6 w-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">Solicitar Documento</h1>
      </div>

      {types.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Nenhum tipo de documento disponivel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {types.map((type) => (
            <button
              key={type.id}
              onClick={() => handleSelect(type)}
              className="bg-white rounded-xl border border-gray-200 p-6 text-left hover:shadow-md transition-shadow"
            >
              <h3 className="text-base font-semibold text-gray-900 mb-2">{type.name}</h3>
              {type.description && (
                <p className="text-sm text-gray-500 mb-3">{type.description}</p>
              )}
              {type.fee != null && (
                <p className="text-sm font-medium text-primary-600">R$ {Number(type.fee).toFixed(2)}</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
