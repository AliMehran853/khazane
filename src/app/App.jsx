import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';

import router from './router';
import { seedDatabase } from '../components/db/seed';
import { useAppStore } from '../components/store/appStore';

function App() {
  const theme = useAppStore((s) => s.theme);

  useEffect(() => {
    seedDatabase().catch((error) => {
      console.error('Failed to initialize Khazane database:', error);
    });
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  return (
    <>
      <div className="kh-bg-layer" data-theme={theme} aria-hidden="true">
        <div className="kh-bg-img" />
        <div className="kh-bg-overlay" />
      </div>

      <RouterProvider router={router} />
    </>
  );
}

export default App;