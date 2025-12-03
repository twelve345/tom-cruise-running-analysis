import { useState } from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from './graphql/client';
import { Header } from './components/Header';
import { AttributionFooter } from './components/layout/AttributionFooter';
import { StatsSection } from './components/stats/StatsSection';
import { FilmographyExplorer } from './components/filmography/FilmographyExplorer';
import { MetricsExplanation } from './components/metrics/MetricsExplanation';
import { VisualizationsSection } from './components/visualizations/VisualizationsSection';
import { FilterBar } from './components/filters/FilterBar';
import { type FilterState, INITIAL_FILTERS } from './types/filters';

function App() {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  return (
    <ApolloProvider client={apolloClient}>
      <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col">
        <div className="container mx-auto p-4 md:p-8 flex-grow">
          <Header />

          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            className="mb-8 -mx-4 md:-mx-8 px-4 md:px-8"
          />

          <main className="space-y-12">
            <StatsSection />
            <FilmographyExplorer filters={filters} />
            <MetricsExplanation />
            <VisualizationsSection filters={filters} />
          </main>
        </div>

        <AttributionFooter />
      </div>
    </ApolloProvider>
  );
}

export default App;
