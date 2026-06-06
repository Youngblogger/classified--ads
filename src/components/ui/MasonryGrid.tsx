export default function MasonryGrid({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`columns-2 sm:columns-3 lg:columns-4 gap-3 [&>*]:mb-3 ${className}`}>
      {children}
    </div>
  );
}
