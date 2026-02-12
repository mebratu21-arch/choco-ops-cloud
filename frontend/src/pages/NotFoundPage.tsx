import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home, ArrowLeft, Candy, SearchX } from 'lucide-react';
import { Button } from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

        {/* Floating chocolate drops */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-amber-800/20 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-amber-700/20 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-5 h-5 bg-amber-900/20 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
      </div>

      <div className="text-center z-10 max-w-lg mx-auto">
        {/* Icon Container */}
        <div className="relative inline-flex items-center justify-center mb-8">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl scale-150" />
          <div className="relative bg-white p-6 rounded-3xl shadow-xl border border-amber-100">
            <div className="relative">
              <Candy className="w-16 h-16 text-primary" />
              <div className="absolute -bottom-1 -right-1 bg-destructive text-white rounded-full p-1">
                <SearchX className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Text */}
        <h1 className="text-8xl font-bold text-primary mb-4 tracking-tight">
          404
        </h1>

        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Page Not Found
        </h2>

        <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
          Oops! It seems like this chocolate recipe got lost in the factory.
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>

          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto shadow-lg shadow-primary/20"
          >
            <Link to="/dashboard">
              <Home className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-amber-100">
          <p className="text-sm text-gray-500 mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link
              to="/inventory"
              className="text-primary hover:underline font-medium"
            >
              Inventory
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              to="/recipes"
              className="text-primary hover:underline font-medium"
            >
              Recipes
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              to="/batches"
              className="text-primary hover:underline font-medium"
            >
              Batches
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              to="/qc"
              className="text-primary hover:underline font-medium"
            >
              Quality Control
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 text-center text-xs text-gray-400">
        CocoaFlow AI - Chocolate Factory Management
      </p>
    </div>
  );
};

export default NotFoundPage;
