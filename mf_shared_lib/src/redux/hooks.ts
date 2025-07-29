import {useDispatch, useSelector} from 'react-redux';
import type {TypedUseSelectorHook} from 'react-redux';
import type {RootState, AppDispatch} from './store';
import type {AppRootState, DynamicSliceRegistry} from './types';
import {hasSlice} from './types';

// Base hooks using the original store types
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Enhanced hooks for module federation context
export const useEnhancedSelector: TypedUseSelectorHook<AppRootState> =
  useSelector;

// Safe slice selector that checks if slice exists at runtime
export function useSafeSliceSelector<K extends keyof DynamicSliceRegistry, T>(
  sliceKey: K,
  selector: (slice: NonNullable<DynamicSliceRegistry[K]>) => T,
  fallback: T
): T {
  return useEnhancedSelector((state) => {
    if (hasSlice(state, sliceKey)) {
      return selector(state[sliceKey] as NonNullable<DynamicSliceRegistry[K]>);
    }
    return fallback;
  });
}

// Hook to check if a slice is available
export function useSliceAvailable<K extends keyof DynamicSliceRegistry>(
  sliceKey: K
): boolean {
  return useEnhancedSelector((state) => hasSlice(state, sliceKey));
}

// Enhanced selector with runtime type guards
export function useTypedSliceSelector<K extends keyof DynamicSliceRegistry, T>(
  sliceKey: K,
  selector: (slice: NonNullable<DynamicSliceRegistry[K]>) => T
): T | undefined {
  return useEnhancedSelector((state) => {
    if (hasSlice(state, sliceKey)) {
      return selector(state[sliceKey] as NonNullable<DynamicSliceRegistry[K]>);
    }
    return undefined;
  });
}
