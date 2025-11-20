import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center mb-10">
      <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter">
        TomCruiseRunningTime.com
      </h1>
      <p className="text-lg text-slate-400 mt-2">
        An Interactive Analysis of Cinema's Most Iconic Sprint
      </p>
    </header>
  );
};
