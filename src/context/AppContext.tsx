import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { appReducer, initialState, type AppAction, type AppState } from '../types/navigation';

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  navigate: (screen: AppState['screen']) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const navigate = (screen: AppState['screen']) => {
    dispatch({ type: 'NAVIGATE', screen });
  };

  return (
    <AppContext.Provider value={{ state, dispatch, navigate }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
