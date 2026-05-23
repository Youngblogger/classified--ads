'use client';

interface AnalyticsChartProps {
  data: { date: string; value: number }[];
  color?: string;
}

export default function AnalyticsChart({ data, color = 'bg-primary-500' }: AnalyticsChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-2">
      {data.map((item) => {
        const date = new Date(item.date);
        const dayLabel = `${days[date.getDay()]} ${date.getDate()}`;
        const pct = (item.value / maxValue) * 100;
        return (
          <div key={item.date} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-16 shrink-0 text-right">{dayLabel}</span>
            <div className="flex-1 h-7 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className={`h-full rounded-lg transition-all duration-500 ${color}`}
                style={{ width: `${Math.max(pct, 1)}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-700 w-10 shrink-0 text-left">
              {item.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
