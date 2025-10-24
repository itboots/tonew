interface CyberButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  loading?: boolean;
}

export default function CyberButton({ onClick, children, loading = false }: CyberButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="relative px-8 py-3 bg-gradient-to-br from-cyber-bg-card to-cyber-primary/20 border-2 border-cyber-primary/80 text-cyber-primary font-bold uppercase tracking-wider transition-all duration-300 hover:bg-cyber-primary hover:text-cyber-dark hover:shadow-[0_0_20px_rgba(0,255,255,0.6)] disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px] min-h-[44px]"
      style={{
        clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
      }}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          处理中...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
