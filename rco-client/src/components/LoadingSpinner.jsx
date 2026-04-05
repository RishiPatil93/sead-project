export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  };

  return (
    <div
      className={`
        ${sizes[size]}
        border-border-default border-t-accent-blue
        rounded-full animate-spin
        ${className}
      `}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-border-default border-t-accent-blue rounded-full animate-spin" />
          <div className="absolute inset-2 border-4 border-border-default border-b-accent-purple rounded-full animate-spin animate-spin-slow" style={{ animationDirection: 'reverse' }} />
        </div>
        <p className="text-text-muted text-sm font-medium animate-pulse">Loading RCO-IDE...</p>
      </div>
    </div>
  );
}
