export default function MasonryGrid({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 ${className}`}>
      {children}
    </div>
  );
}
