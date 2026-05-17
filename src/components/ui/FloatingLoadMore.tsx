'use client';

export default function FloatingLoadMore() {
  return (
    <div className="flex justify-center py-6">
      <div className="inline-flex items-center gap-3 px-5 py-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100/80 animate-[slideUpFade_0.35s_ease-out_forwards]">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary-500"
              style={{ animation: 'zigzagBounce 1s ease-in-out infinite' }}
            />
          ))}
        </div>
        <span className="text-sm text-gray-500 font-medium">Loading more ads</span>
      </div>
    </div>
  );
}
