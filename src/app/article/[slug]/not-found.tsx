import Link from 'next/link';
import { ArrowLeft, FileX, Home, BookOpen } from 'lucide-react';

export default function ArticleNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950/95 via-stone-900/95 to-amber-950/95 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-amber-500/3 via-orange-500/2 to-yellow-500/3 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/2 via-transparent to-orange-500/2 pointer-events-none" />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-2xl mx-auto text-center">
            {/* 404 Icon */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
                <FileX className="w-12 h-12 text-amber-400" />
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Article Not Found
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              The article you're looking for doesn't exist or may have been moved. 
              Don't worry, we have plenty of other great content for you to explore.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/article"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors duration-300"
              >
                <BookOpen className="w-5 h-5" />
                Browse All Articles
              </Link>
              
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-colors duration-300"
              >
                <Home className="w-5 h-5" />
                Go Home
              </Link>
            </div>

            {/* Additional Help */}
            <div className="mt-12 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Need Help?</h3>
              <p className="text-gray-400 text-sm mb-4">
                If you believe this is an error, you can:
              </p>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>• Check the URL for typos</li>
                <li>• Go back to the articles page and search for what you need</li>
                <li>• Contact our support team if the issue persists</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
