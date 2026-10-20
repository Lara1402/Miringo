import { describe, it, expect, beforeEach, vi } from 'vitest';
import { introAudio } from './introAudio';

describe('Intro Audio Manager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('manages mute and unmute state correctly', () => {
    introAudio.setMuted(true);
    expect(introAudio.getMuted()).toBe(true);

    introAudio.setMuted(false);
    expect(introAudio.getMuted()).toBe(false);
  });

  it('safely handles audio triggers without crashing in headless / test environments', () => {
    expect(() => introAudio.playEnergyCharge()).not.toThrow();
    expect(() => introAudio.playBrandReveal()).not.toThrow();
    expect(() => introAudio.playPortalWarp()).not.toThrow();
    expect(() => introAudio.playResolution()).not.toThrow();
    expect(() => introAudio.playCharacterSwitch()).not.toThrow();
    expect(() => introAudio.playMissionPassed()).not.toThrow();
    expect(() => introAudio.playWeaponWheelTick()).not.toThrow();
    expect(() => introAudio.playWantedPing()).not.toThrow();
    expect(() => introAudio.playWasted()).not.toThrow();
    expect(() => introAudio.cleanup()).not.toThrow();
  });
});
