import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from './graphql/client';
import { Header } from './components/Header';
import { AttributionFooter } from './components/layout/AttributionFooter';
import { StatsSection } from './components/stats/StatsSection';
import { FilmographyExplorer } from './components/filmography/FilmographyExplorer';
import { MetricsExplanation } from './components/metrics/MetricsExplanation';
import { VisualizationsSection } from './components/visualizations/VisualizationsSection';

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col">
        <div className="container mx-auto p-4 md:p-8 flex-grow">
          <Header />

          <main className="space-y-12">
            <StatsSection />
            <FilmographyExplorer />
            <MetricsExplanation />
            <VisualizationsSection />
          </main>
        </div>

        <AttributionFooter />
      </div>
    </ApolloProvider>
  );
}

export default App;
