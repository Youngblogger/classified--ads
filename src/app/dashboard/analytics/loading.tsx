export default function AnalyticsLoading() {
  const shimmer = 'relative overflow-hidden bg-gray-200';
  const overlay = 'absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {['7d', '30d', '90d'].map((p) => (
          <div key={p} className={`h-9 w-14 rounded-lg ${shimmer}`}>
            <div className={overlay} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`h-4 w-16 rounded-lg ${shimmer}`}><div className={overlay} /></div>
              <div className={`h-8 w-8 rounded-lg ${shimmer}`}><div className={overlay} /></div>
            </div>
            <div className={`h-7 w-20 rounded-lg ${shimmer}`}><div className={overlay} /></div>
            <div className={`h-3 w-12 rounded-lg mt-2 ${shimmer}`}><div className={overlay} /></div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className={`h-5 w-32 rounded-lg mb-4 ${shimmer}`}><div className={overlay} /></div>
        <div className="space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`h-3 w-16 rounded ${shimmer}`}><div className={overlay} /></div>
              <div className={`flex-1 h-7 rounded-lg ${shimmer}`}><div className={overlay} /></div>
              <div className={`h-3 w-10 rounded ${shimmer}`}><div className={overlay} /></div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className={`h-5 w-40 rounded-lg mb-4 ${shimmer}`}><div className={overlay} /></div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className={`h-6 w-6 rounded-full ${shimmer}`}><div className={overlay} /></div>
              <div className={`flex-1 h-4 rounded-lg ${shimmer}`}><div className={overlay} /></div>
              <div className={`h-4 w-12 rounded ${shimmer}`}><div className={overlay} /></div>
              <div className={`h-4 w-12 rounded ${shimmer}`}><div className={overlay} /></div>
              <div className={`h-4 w-10 rounded ${shimmer}`}><div className={overlay} /></div>
              <div className={`h-4 w-10 rounded ${shimmer}`}><div className={overlay} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
