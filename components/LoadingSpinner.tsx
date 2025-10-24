interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = '正在加载...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-cyber-primary/40 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-cyber-primary rounded-full animate-spin glow-cyan"></div>
      </div>
      <p className="mt-4 text-cyber-text text-sm">{message}</p>
    </div>
  );
}
