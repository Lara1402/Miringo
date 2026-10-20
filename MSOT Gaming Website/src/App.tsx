import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthProvider';
import { router } from './router';
import { CinematicIntro } from './components/animation/CinematicIntro';
import { useIntroState } from './hooks/useIntroState';

export function App() {
  const { introComplete, completeIntro } = useIntroState();

  return (
    <AuthProvider>
      {!introComplete && <CinematicIntro onComplete={completeIntro} />}
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(14, 16, 20, 0.95)',
            color: '#e2e8f0',
            border: '1px solid rgba(63, 63, 70, 0.6)',
            backdropFilter: 'blur(12px)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '12px',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#080808',
            },
          },
          error: {
            iconTheme: {
              primary: '#dc2626',
              secondary: '#080808',
            },
          },
        }}
      />
    </AuthProvider>
  );
}
