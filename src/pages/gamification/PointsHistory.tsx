import { History } from 'lucide-react';

export default function PointsHistory() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <History className="h-6 w-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">Histórico de Pontos</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-sm text-gray-500">Em breve.</p>
      </div>
    </div>
  );
}
