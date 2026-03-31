import { Gift } from 'lucide-react';

export default function Prizes() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Gift className="h-6 w-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">Prêmios</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-sm text-gray-500">Em breve.</p>
      </div>
    </div>
  );
}
