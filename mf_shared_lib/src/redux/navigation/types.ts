export interface PendingNavigation {
  path: string;
  replace?: boolean;
}

export interface NavigationState {
  pendingNavigation: PendingNavigation | null;
}
