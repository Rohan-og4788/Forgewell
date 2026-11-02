import { ThemeToggle } from '../components/ThemeToggle';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-page text-fg flex items-center justify-center relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p className="text-muted">You are signed in.</p>
      </div>
    </div>
  );
}
