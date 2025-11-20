/**
 * DataSourceBadge Component
 *
 * Displays inline attribution badge with tooltip for data sources
 */

import React, { useState } from 'react';

interface DataSourceInfo {
  name: string;
  url?: string;
  description?: string;
  logo?: string;
}

const DATA_SOURCES: Record<string, DataSourceInfo> = {
  tmdb: {
    name: 'TMDB',
    url: 'https://www.themoviedb.org',
    description: 'Film metadata from The Movie Database',
    logo: '/tmdb-logo.svg',
  },
  'rotten-tomatoes': {
    name: 'Rotten Tomatoes',
    url: 'https://editorial.rottentomatoes.com/article/the-more-tom-cruise-runs-the-better-his-movies-are/',
    description: 'Running distance data and methodology',
  },
  'movies-films-flix': {
    name: 'Movies Films & Flix',
    url: 'https://moviesfilmsandflix.com/2025/04/27/the-tom-cruise-running-special-ranking-his-best-running-moments-since-1981/',
    description: '295 running instances ranked and analyzed',
  },
};

interface DataSourceBadgeProps {
  source: keyof typeof DATA_SOURCES;
  children?: React.ReactNode;
  className?: string;
}

export const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({
  source,
  children,
  className = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const sourceInfo = DATA_SOURCES[source];

  if (!sourceInfo) return <>{children}</>;

  return (
    <div className={`inline-flex items-center gap-1 relative ${className}`}>
      {children}
      <div
        className="inline-block"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <button
          className="text-xs text-gray-400 hover:text-blue-400 transition-colors p-1"
          aria-label={`Data from ${sourceInfo.name}`}
        >
          <svg
            className="w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-50 border border-gray-700">
            <div className="font-semibold">{sourceInfo.name}</div>
            {sourceInfo.description && (
              <div className="text-gray-300 mt-1">{sourceInfo.description}</div>
            )}
            {sourceInfo.url && (
              <div className="text-blue-400 mt-1 text-[10px]">Click for details →</div>
            )}
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
              <div className="border-4 border-transparent border-t-gray-800" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * PosterWithAttribution Component
 *
 * Wraps film poster with TMDB attribution overlay
 */
interface PosterWithAttributionProps {
  src: string;
  alt: string;
  className?: string;
}

export const PosterWithAttribution: React.FC<PosterWithAttributionProps> = ({
  src,
  alt,
  className = '',
}) => {
  return (
    <div className={`relative group ${className}`}>
      <img src={src} alt={alt} className="w-full h-full object-cover" />

      {/* TMDB Attribution Overlay */}
      <div className="absolute bottom-0 right-0 bg-black/80 p-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
        <a
          href="https://www.themoviedb.org"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
          aria-label="Poster from TMDB"
        >
          <img src="/tmdb-logo.svg" alt="TMDB" className="h-3" />
        </a>
      </div>
    </div>
  );
};
