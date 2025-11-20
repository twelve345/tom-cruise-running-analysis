import React from 'react';

export const MetricsExplanation: React.FC = () => {
  return (
    <section id="metrics" className="mb-12">
      <div className="bg-slate-800 rounded-lg shadow-lg p-8 border border-slate-700">
        <h2 className="text-3xl font-bold text-center mb-8 text-white">
          Understanding the Cruise Performance Index (CPI)
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Formula & Calculation */}
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-lg border border-amber-500/30">
              <h3 className="text-xl font-semibold text-amber-400 mb-4">The Formula</h3>
              <div className="text-center py-4">
                <div className="text-2xl font-mono text-white mb-2">
                  CPI = <span className="text-amber-400">(Distance ÷ Runtime)</span> ×{' '}
                  <span className="text-blue-400">(RT Score ÷ 100)</span>
                </div>
                <div className="text-sm text-slate-400 mt-4 space-y-1">
                  <div>
                    <span className="text-amber-400">Distance</span> = Total running distance (feet)
                  </div>
                  <div>
                    <span className="text-amber-400">Runtime</span> = Film duration (minutes)
                  </div>
                  <div>
                    <span className="text-blue-400">RT Score</span> = Rotten Tomatoes score (0-100)
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-lg border border-blue-500/30">
              <h3 className="text-xl font-semibold text-blue-400 mb-4">Example Calculation</h3>
              <div className="space-y-3">
                <div className="text-lg font-semibold text-white">
                  Mission: Impossible - Ghost Protocol
                </div>
                <div className="font-mono text-sm space-y-2 text-slate-300">
                  <div>
                    Distance: <span className="text-amber-400">3,066 feet</span>
                  </div>
                  <div>
                    Runtime: <span className="text-amber-400">120 minutes</span>
                  </div>
                  <div>
                    RT Score: <span className="text-blue-400">93%</span>
                  </div>
                </div>
                <div className="border-t border-slate-700 pt-3 mt-3">
                  <div className="font-mono text-sm text-slate-400">(3,066 ÷ 120) × (93 ÷ 100)</div>
                  <div className="font-mono text-sm text-slate-400">= 25.55 × 0.93</div>
                  <div className="text-2xl font-bold text-amber-400 mt-2">= 23.76 CPI</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Explanation & Context */}
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-4">Why CPI Matters</h3>
              <div className="space-y-4 text-slate-300 leading-relaxed">
                <p>
                  The Cruise Performance Index isn't just about raw distance. It combines{' '}
                  <span className="text-amber-400 font-semibold">running efficiency</span> (feet per
                  minute) with <span className="text-blue-400 font-semibold">film quality</span>{' '}
                  (Rotten Tomatoes score).
                </p>
                <p>
                  A film can have lots of running but still be mediocre. CPI rewards movies that
                  deliver <strong className="text-white">both</strong> intense Tom Cruise action{' '}
                  <strong className="text-white">and</strong> critical acclaim.
                </p>
                <p className="text-sm italic text-slate-400">
                  Example: A 3-hour film with 2,000 feet of running (slow pacing) will score lower
                  than a 2-hour film with the same distance (intense pacing), especially if quality
                  differs.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-4">What Makes a Good CPI?</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded border-l-4 border-amber-500">
                  <span className="font-semibold text-white">Excellent (20+)</span>
                  <span className="text-sm text-slate-400">Peak Tom performances</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded border-l-4 border-yellow-500">
                  <span className="font-semibold text-white">Good (10-20)</span>
                  <span className="text-sm text-slate-400">Solid running + quality</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded border-l-4 border-blue-500">
                  <span className="font-semibold text-white">Average (5-10)</span>
                  <span className="text-sm text-slate-400">Decent effort</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded border-l-4 border-slate-600">
                  <span className="font-semibold text-white">Low (&lt;5)</span>
                  <span className="text-sm text-slate-400">Minimal running or quality</span>
                </div>
              </div>
              <p className="text-sm text-slate-400 mt-4 italic">
                The Mission: Impossible franchise dominates the top CPI spots, combining high
                running density with consistent critical praise.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-slate-400 text-sm">
          <p>
            CPI is our proprietary metric for measuring peak Tom Cruise. Use it to identify the
            films where running + quality reach maximum velocity.
          </p>
        </div>
      </div>
    </section>
  );
};
