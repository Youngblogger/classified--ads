export default function MasonryGrid({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`w-full columns-2 gap-x-3 sm:columns-3 lg:columns-4 [&>*]:mb-3 ${className}`}>
      {children}
    </div>
  );
}
