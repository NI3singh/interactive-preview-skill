import { useSyncExternalStore } from "react";

/**
 * Minimal dependency-free store for demo state.
 *
 * The generated `preview/mock/store.ts` builds on this so reconstructed screens can react to
 * mock-state changes — adding a friend flips a button to "Added", bumps a counter, drops a post
 * into the feed. Those visible consequences are what make the demo feel real.
 *
 * It lives only in memory and never touches the network, which is exactly what a preview wants:
 * it resets on reload and can't fail.
 */
export function createStore<T extends object>(initial: T) {
  let state = initial;
  const listeners = new Set<() => void>();

  const getState = () => state;

  const setState = (patch: Partial<T> | ((s: T) => Partial<T>)) => {
    const next = typeof patch === "function" ? (patch as (s: T) => Partial<T>)(state) : patch;
    state = { ...state, ...next };
    listeners.forEach((l) => l());
  };

  const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  };

  /** Read a slice of state in a component; re-renders when that slice changes. */
  function useStore<S>(selector: (s: T) => S): S {
    return useSyncExternalStore(
      subscribe,
      () => selector(state),
      () => selector(initial)
    );
  }

  return { getState, setState, subscribe, useStore };
}
