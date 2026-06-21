import { Children, isValidElement, ReactNode } from 'react';

function distribute(items: ReactNode[], cols: number): ReactNode[][] {
  const result = Array.from({ length: cols }, () => [] as ReactNode[]);
  items.forEach((item, i) => {
    result[i % cols].push(item);
  });
  return result;
}

function Columns({ items, numCols, className }: { items: ReactNode[]; numCols: number; className: string }) {
  const cols = distribute(items, numCols);
  return (
    <div className={`${className} gap-1.5`}>
      {cols.map((col, i) => (
        <div key={i} className="flex-1 flex flex-col gap-1.5 min-w-0">
          {col}
        </div>
      ))}
    </div>
  );
}

export default function MasonryGrid({ children, className = '' }: { children: ReactNode; className?: string }) {
  const items = Children.toArray(children).filter(isValidElement);

  if (items.length === 0) return null;

  return (
    <div className={`w-full ${className}`}>
      <Columns items={items} numCols={2} className="flex sm:hidden" />
      <Columns items={items} numCols={3} className="hidden sm:flex lg:hidden" />
      <Columns items={items} numCols={4} className="hidden lg:flex" />
    </div>
  );
}
