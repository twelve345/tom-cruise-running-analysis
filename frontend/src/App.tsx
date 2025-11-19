import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from './graphql/client';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { StatsSection } from './components/stats/StatsSection';
import { FilmographyExplorer } from './components/filmography/FilmographyExplorer';
import { VisualizationsSection } from './components/visualizations/VisualizationsSection';

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
        <div className="container mx-auto p-4 md:p-8">
          <Header />

          <main className="space-y-12">
            <StatsSection />
            <FilmographyExplorer />
            <VisualizationsSection />
          </main>

          <Footer />
        </div>
      </div>
    </ApolloProvider>
  );
}

export default App;
