import { GtaIntroSequence } from '../intro/GtaIntroSequence';

interface CinematicIntroProps {
  onComplete: () => void;
}

export function CinematicIntro({ onComplete }: CinematicIntroProps) {
  return <GtaIntroSequence onComplete={onComplete} />;
}

export { GtaIntroSequence };
