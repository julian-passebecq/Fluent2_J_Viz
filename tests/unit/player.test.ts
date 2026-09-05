import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StoryPlayer } from '../../src/core/player.js';
import { catalog } from '../../src/examples/index.js';

describe('deterministic discrete player', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  const story = catalog[0].story;
  it('starts paused and never advances without play', () => {
    const p = new StoryPlayer(story);
    vi.advanceTimersByTime(60000);
    expect(p.getState()).toMatchObject({ index: 0, playing: false });
    p.dispose();
  });
  it('advances at exact interval boundaries and stops on the final scene', () => {
    const p = new StoryPlayer(story);
    p.play();
    vi.advanceTimersByTime(story.intervalMs - 1);
    expect(p.getState().index).toBe(0);
    vi.advanceTimersByTime(1);
    expect(p.getState().index).toBe(1);
    vi.advanceTimersByTime(story.intervalMs * 20);
    expect(p.getState()).toMatchObject({ index: story.scenes.length - 1, playing: false });
    expect(vi.getTimerCount()).toBe(0);
    p.dispose();
  });
  it('play is idempotent and does not create competing clocks', () => {
    const p = new StoryPlayer(story);
    p.play();
    p.play();
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(story.intervalMs);
    expect(p.getState().index).toBe(1);
    p.dispose();
  });
  it('pause cancels future advancement and resume starts a fresh interval', () => {
    const p = new StoryPlayer(story);
    p.play();
    vi.advanceTimersByTime(1000);
    p.pause();
    vi.advanceTimersByTime(30000);
    expect(p.getState().index).toBe(0);
    p.play();
    vi.advanceTimersByTime(story.intervalMs - 1);
    expect(p.getState().index).toBe(0);
    vi.advanceTimersByTime(1);
    expect(p.getState().index).toBe(1);
    p.dispose();
  });
  it('manual navigation pauses, clamps and reset is repeatable', () => {
    const p = new StoryPlayer(story);
    p.previous();
    expect(p.getState().index).toBe(0);
    p.play();
    p.next();
    expect(p.getState()).toMatchObject({ index: 1, playing: false });
    p.previous();
    p.reset();
    p.reset();
    expect(p.getScene().id).toBe(story.scenes[0].id);
    expect(vi.getTimerCount()).toBe(0);
    p.dispose();
  });
  it('seek validates indices and clears the clock', () => {
    const p = new StoryPlayer(story);
    p.play();
    p.seek(2);
    expect(p.getState()).toMatchObject({ index: 2, playing: false });
    expect(() => p.seek(-1)).toThrow();
    expect(() => p.seek(0.5)).toThrow();
    expect(() => p.seek(99)).toThrow();
    p.dispose();
  });
  it('reduced motion preserves the same scene sequence', () => {
    const p = new StoryPlayer(story, true);
    p.play();
    vi.advanceTimersByTime(story.intervalMs);
    expect(p.getState()).toMatchObject({ index: 1, reducedMotion: true });
    p.setReducedMotion(false);
    expect(p.getState().index).toBe(1);
    p.dispose();
  });
  it('disposal cancels timers, detaches subscriptions and prevents later updates', () => {
    const p = new StoryPlayer(story),
      callback = vi.fn();
    p.subscribe(callback);
    p.play();
    p.dispose();
    const calls = callback.mock.calls.length;
    vi.advanceTimersByTime(10000);
    p.next();
    p.play();
    expect(callback).toHaveBeenCalledTimes(calls);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('returns referentially stable snapshots between actions', () => {
    const p = new StoryPlayer(story);
    const snapshot = p.getState();
    expect(p.getState()).toBe(snapshot);
    p.next();
    expect(p.getState()).not.toBe(snapshot);
    p.dispose();
  });
});
