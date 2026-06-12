export default function MasonryGrid({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`w-full columns-2 sm:columns-3 lg:columns-4 gap-2 [&>*]:mb-2 ${className}`}>
      {children}
    </div>
  );
}
