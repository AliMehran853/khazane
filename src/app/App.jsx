import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';

import router from './router';
import { seedDatabase } from '../components/db/seed';

function App() {
  useEffect(() => {
    seedDatabase().catch((error) => {
      console.error('Failed to initialize Khazane database:', error);
    });
  }, []);

  return (
    <>
      {/* ⭐ لایه‌ی پس‌زمینه داخل DOM، نه خارج از stacking context */}
      <div className="kh-bg-layer" aria-hidden="true">
        <div className="kh-bg-img" />
        <div className="kh-bg-overlay" />
      </div>

      <RouterProvider router={router} />
    </>
  );
}

export default App;