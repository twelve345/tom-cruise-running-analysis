/**
 * Credits & Attribution Page
 *
 * Comprehensive attribution for all data sources per legal requirements
 * and ethical transparency.
 */

import React from 'react';

export const CreditsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">About This Project</h1>
          <p className="text-lg text-slate-400">
            This is a portfolio project analyzing Tom Cruise's on-screen running across his
            filmography. All data is sourced from publicly available research and APIs.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-12">
          {/* Film Metadata - TMDB */}
          <section className="bg-slate-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">Film Metadata</h2>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">
                Source:{' '}
                <a
                  href="https://www.themoviedb.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  The Movie Database (TMDB)
                </a>
              </h3>

              <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
                <li>Runtime data</li>
                <li>Poster images</li>
                <li>IMDB identifiers</li>
                <li>TMDB identifiers</li>
              </ul>
            </div>

            <div className="bg-slate-900 p-4 rounded border border-slate-700 mb-4">
              <p className="text-sm text-slate-400">
                <strong className="text-slate-300">Attribution:</strong> This product uses the TMDB
                API but is not endorsed or certified by TMDB.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://www.themoviedb.org"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <img src="/tmdb-logo-long.svg" alt="TMDB" className="h-8" />
              </a>
            </div>
          </section>

          {/* Running Distance Data - Rotten Tomatoes */}
          <section className="bg-slate-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4 text-green-400">Running Distance Data</h2>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">
                Source:{' '}
                <a
                  href="https://editorial.rottentomatoes.com/article/the-more-tom-cruise-runs-the-better-his-movies-are/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 underline"
                >
                  Rotten Tomatoes - "The More Tom Cruise Runs, The Better His Movies Are"
                </a>
              </h3>

              <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
                <li>Total career running distance: 32,444 feet</li>
                <li>Film-by-film running distances (top 10 + categories)</li>
                <li>
                  Calculation methodology: 14.6 feet/second{' '}
                  <span className="text-slate-400">(6-minute mile pace)</span>
                </li>
              </ul>
            </div>

            <p className="text-sm text-slate-400">Published: 2018 (updated 2025)</p>
          </section>

          {/* Running Scene Analysis - Movies Films & Flix */}
          <section className="bg-slate-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4 text-purple-400">Running Scene Analysis</h2>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">
                Source:{' '}
                <a
                  href="https://moviesfilmsandflix.com/2025/04/27/the-tom-cruise-running-special-ranking-his-best-running-moments-since-1981/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 underline"
                >
                  Movies, Films & Flix - "The Tom Cruise Running Special"
                </a>
              </h3>

              <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
                <li>295 running instances ranked by quality</li>
                <li>Scene descriptions and context</li>
                <li>Timestamps for top 25 scenes</li>
                <li>Detailed analysis of top 10 running moments</li>
              </ul>
            </div>

            <p className="text-sm text-slate-400">Author: Mark Hobin</p>
          </section>

          {/* Video References */}
          <section className="bg-slate-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4 text-red-400">Video References</h2>

            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">
                Source:{' '}
                <a
                  href="https://www.youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-400 hover:text-red-300 underline"
                >
                  Burger Fiction - "Every Tom Cruise Run. Ever."
                </a>
              </h3>

              <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
                <li>18+ minute supercut of running scenes</li>
                <li>Reference for scene verification</li>
              </ul>
            </div>
          </section>

          {/* Our Analysis */}
          <section className="bg-slate-800 rounded-lg p-8 border-2 border-blue-500">
            <h2 className="text-2xl font-bold mb-4">Our Analysis</h2>

            <p className="text-slate-300 mb-6">
              This project synthesizes the above sources and adds original analysis:
            </p>

            <div className="space-y-6">
              {/* CPI */}
              <div>
                <h3 className="text-xl font-semibold mb-2 text-blue-400">
                  Cruise Performance Index (CPI)
                </h3>
                <p className="text-slate-300 mb-2">
                  <strong>Formula:</strong>{' '}
                  <code className="bg-slate-900 px-2 py-1 rounded text-sm">
                    (Running Distance ÷ Runtime) × (Rotten Tomatoes Score ÷ 100)
                  </code>
                </p>
                <p className="text-slate-400 text-sm">
                  A custom metric combining running efficiency with film quality. Created for this
                  project.
                </p>
              </div>

              {/* Running Density */}
              <div>
                <h3 className="text-xl font-semibold mb-2 text-blue-400">Running Density</h3>
                <p className="text-slate-300 mb-2">
                  <strong>Formula:</strong>{' '}
                  <code className="bg-slate-900 px-2 py-1 rounded text-sm">
                    Total Running Distance (feet) ÷ Runtime (minutes)
                  </code>
                </p>
                <p className="text-slate-400 text-sm">
                  Measures running intensity per minute of film. Created for this project.
                </p>
              </div>

              {/* Data Integration */}
              <div>
                <h3 className="text-xl font-semibold mb-2 text-blue-400">Data Integration</h3>
                <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
                  <li>Cross-referenced multiple sources</li>
                  <li>Structured data for analysis</li>
                  <li>Built visualization dashboard</li>
                  <li>Implemented search and filtering</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Technology Stack */}
          <section className="bg-slate-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Technology Stack</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 text-blue-400">Frontend</h3>
                <ul className="text-slate-300 space-y-1 text-sm">
                  <li>• React 19</li>
                  <li>• TypeScript</li>
                  <li>• Tailwind CSS</li>
                  <li>• Chart.js</li>
                  <li>• Apollo Client</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-green-400">Backend</h3>
                <ul className="text-slate-300 space-y-1 text-sm">
                  <li>• Node.js</li>
                  <li>• Express</li>
                  <li>• GraphQL</li>
                  <li>• PostgreSQL</li>
                  <li>• MongoDB</li>
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2 text-purple-400">APIs</h3>
              <p className="text-slate-300 text-sm">TMDB API for film metadata</p>
            </div>
          </section>

          {/* Purpose */}
          <section className="bg-slate-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Purpose</h2>

            <p className="text-slate-300 mb-4">This is a portfolio project demonstrating:</p>

            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Full-stack development</li>
              <li>Polyglot persistence (SQL + NoSQL)</li>
              <li>Data integration from multiple sources</li>
              <li>API consumption and data transformation</li>
              <li>Interactive data visualization</li>
              <li>GraphQL API design</li>
            </ul>

            <div className="mt-6 p-4 bg-slate-900 rounded border border-slate-700">
              <p className="text-slate-400 text-sm">
                <strong className="text-slate-300">Note:</strong> Not intended for commercial use.
                This is an educational project demonstrating technical skills.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-slate-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Contact & Source Code</h2>

            <div className="space-y-3 text-slate-300">
              <p>
                <strong className="text-slate-200">GitHub:</strong>{' '}
                <a
                  href="https://github.com/twelve345/tom-cruise-running-analysis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  github.com/twelve345/tom-cruise-running-analysis
                </a>
              </p>

              <p className="text-sm text-slate-400">
                All source code is available under MIT License.
              </p>
            </div>
          </section>
        </div>

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <a
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};
