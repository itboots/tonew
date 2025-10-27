import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-3xl" />
          <h1 className="relative text-9xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            404
          </h1>
        </div>
        
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">
          PAGE NOT FOUND
        </h2>
        
        <p className="text-cyan-300/70 mb-8 max-w-md mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>
        
        <Link 
          href="/"
          className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/60 text-cyan-400 rounded font-bold uppercase tracking-wider transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(0,255,255,0.6)]"
          style={{
            clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
          }}
        >
          ← RETURN HOME
        </Link>
      </div>
    </div>
  );
}
