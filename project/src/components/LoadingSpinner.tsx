interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingSpinner({ fullScreen, size = 'md' }: LoadingSpinnerProps) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };

  const spinner = (
    <div className={`${sizes[size]} border-4 border-green-200 border-t-green-600 rounded-full animate-spin`} />
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-center gap-4">
        <div className="h-16 w-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
        <p className="text-green-700 font-medium text-lg">Loading Nafi-AgriMarket...</p>
      </div>
    );
  }

  return spinner;
}
