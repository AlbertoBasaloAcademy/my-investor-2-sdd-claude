import { HealthStatus } from './features/health/HealthStatus';
import { RocketCatalog } from './features/rockets/RocketCatalog';
import { LaunchCatalog } from './features/launches/LaunchCatalog';
import { BookingsFeature } from './features/bookings/BookingsFeature';
import { useLaunches } from './features/launches/useLaunches';
import './App.css';

function App() {
  const { launches } = useLaunches();

  return (
    <main className="app-shell">
      <h1 className="app-hero">ab-java-react</h1>
      <HealthStatus />
      <RocketCatalog />
      <LaunchCatalog />
      <BookingsFeature launches={launches} />
    </main>
  );
}

export default App;
