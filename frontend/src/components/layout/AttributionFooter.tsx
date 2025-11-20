/**
 * Attribution Footer Component
 *
 * Displays data source attributions per TMDB requirements and ethical transparency.
 * Shown on all pages.
 */

import React, { useState } from 'react';
import { CreditsModal } from './CreditsModal';

export const AttributionFooter: React.FC = () => {
  const [showCreditsModal, setShowCreditsModal] = useState(false);

  return (
    <>
      <footer className="bg-gray-900 text-white py-6 mt-auto border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left: Data sources */}
            <div className="text-sm text-gray-400 text-center md:text-left">
              <span className="block md:inline">Data sources: </span>
              <button
                onClick={() => setShowCreditsModal(true)}
                className="text-blue-400 hover:text-blue-300 hover:underline transition-colors cursor-pointer"
              >
                TMDB • Rotten Tomatoes • gshick (GitHub) • Mark Hobin (Movies Films & Flix)
              </button>
            </div>

            {/* Center: TMDB logo and attribution */}
            <div className="flex flex-col items-center gap-2">
              <a
                href="https://www.themoviedb.org"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity cursor-pointer"
              >
                <img src="/tmdb-logo-long.svg" alt="The Movie Database" className="h-5" />
              </a>
              <span className="text-xs text-gray-500 max-w-md text-center">
                This product uses the TMDB API but is not endorsed or certified by TMDB.
              </span>
            </div>

            {/* Right: Project info */}
            <div className="text-sm text-gray-400 text-center md:text-right">
              <span className="block md:inline">Portfolio project • </span>
              <button
                onClick={() => setShowCreditsModal(true)}
                className="text-blue-400 hover:text-blue-300 hover:underline transition-colors cursor-pointer"
              >
                About & Credits
              </button>
            </div>
          </div>

          {/* Optional: Copyright/License */}
          <div className="text-center text-xs text-gray-600 mt-4 pt-4 border-t border-gray-800">
            <p>
              Film data © respective studios. Metadata courtesy of TMDB. Analysis © respective
              publishers. Built for educational purposes.
            </p>
          </div>
        </div>
      </footer>

      <CreditsModal isOpen={showCreditsModal} onClose={() => setShowCreditsModal(false)} />
    </>
  );
};
