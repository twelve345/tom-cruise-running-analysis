function App() {
  // Intentional errors for testing pre-commit hooks
  const unusedTypedVariable: string = 'This will trigger TypeScript ESLint warning';
  const badFormatting = { test: 'value', foo: 123, bar: true }; // Bad spacing

  return (
    <div>
      <h1>Tom Cruise Running Time</h1>
    </div>
  );
}

export default App;
