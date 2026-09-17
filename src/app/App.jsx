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

  return <RouterProvider router={router} />;
}

export default App;