import { useState, useCallback } from 'react';

export const GTA_INTRO_KEY = 'gta_intro_seen';
export const LEGACY_INTRO_KEY = 'nova_intro_seen';

export function useIntroState() {
  const [introComplete, setIntroComplete] = useState(() => {
    if (typeof window === 'undefined') return false;
    const gtaSeen = localStorage.getItem(GTA_INTRO_KEY) === 'true';
    const legacySeen = sessionStorage.getItem(LEGACY_INTRO_KEY) === 'true';
    return gtaSeen || legacySeen;
  });

  const completeIntro = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(GTA_INTRO_KEY, 'true');
      sessionStorage.setItem(LEGACY_INTRO_KEY, 'true');
    }
    setIntroComplete(true);
  }, []);

  const replayIntro = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(GTA_INTRO_KEY);
      sessionStorage.removeItem(LEGACY_INTRO_KEY);
    }
    setIntroComplete(false);
  }, []);

  return { introComplete, completeIntro, replayIntro };
}
