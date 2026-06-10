import { HealthStatus } from './features/health/HealthStatus';
import { RocketCatalog } from './features/rockets/RocketCatalog';
import { LaunchCatalog } from './features/launches/LaunchCatalog';
import './App.css';

function App() {
  return (
    <main className="app-shell">
      <h1 className="app-hero">ab-java-react</h1>
      <HealthStatus />
      <RocketCatalog />
      <LaunchCatalog />
    </main>
  );
}

export default App;
