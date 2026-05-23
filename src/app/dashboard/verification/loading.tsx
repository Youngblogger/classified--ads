import { Shield } from 'lucide-react';

export default function VerificationLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Verification Center</h2>
        <p className="text-gray-500 text-sm mt-1">Manage your account verification</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-card p-6 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-xl" />
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-gray-200 rounded-lg w-32" />
                <div className="h-4 bg-gray-200 rounded-lg w-48" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded-lg w-24" />
              <div className="h-10 bg-gray-200 rounded-xl w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
