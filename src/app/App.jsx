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
      {/* ⭐ لایه‌ی پس‌زمینه‌ی عکس — fixed برای همه‌ی صفحات */}
      <div className="kh-bg-layer" aria-hidden="true">
        <img src="/background.png" alt="" className="kh-bg-img" />
        <div className="kh-bg-overlay" />
      </div>

      <RouterProvider router={router} />
    </>
  );
}

export default App;