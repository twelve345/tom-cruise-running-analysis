import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="text-center mt-12 pt-8 border-t border-slate-700">
      <p className="text-slate-500">
        Data compiled from Rotten Tomatoes, Reddit (r/theydidthemath), and various film analysis
        articles.
      </p>
      <p className="text-slate-500 mt-2">An interactive project by TomCruiseRunningTime.com</p>
    </footer>
  );
};
