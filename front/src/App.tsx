import { HealthStatus } from './features/health/HealthStatus';
import { RocketCatalog } from './features/rockets/RocketCatalog';
import './App.css';

function App() {
  return (
    <main className="app-shell">
      <h1 className="app-hero">ab-java-react</h1>
      <HealthStatus />
      <RocketCatalog />
    </main>
  );
}

export default App;
