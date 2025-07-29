import type {NavigationState} from './navigation/types';

// Base types that are always available
export interface BaseRootState {
  navigationReducer: NavigationState;
}

// Registry for dynamically injected slice types
// This will be augmented by individual MFEs through module federation
export interface DynamicSliceRegistry {
  // Placeholder - these will be augmented by consuming MFEs
  // Using any instead of unknown to allow proper augmentation
  [K: string]: any;
}

// Combined root state that merges base + dynamic
export type AppRootState = BaseRootState & DynamicSliceRegistry;

// Type-safe selectors with fallbacks
export type AppSelector<T> = (state: AppRootState) => T;

// Helper type for slice existence checking
export type SliceKey = keyof DynamicSliceRegistry;

// Utility to check if a slice is loaded at runtime
export function hasSlice<K extends SliceKey>(
  state: AppRootState,
  sliceKey: K
): state is AppRootState & Record<K, NonNullable<DynamicSliceRegistry[K]>> {
  return state[sliceKey] != null && state[sliceKey] !== undefined;
}
