// src/context/SelectedItemContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { GlobalItem } from '../components/rpg/AdminItemsPanel';

type SelectedItem = GlobalItem | null;

interface SelectedItemContextProps {
  selected: SelectedItem;
  setSelected: (item: SelectedItem) => void;
}

const SelectedItemContext = createContext<SelectedItemContextProps | undefined>(undefined);

export const SelectedItemProvider = ({ children }: { children: ReactNode }) => {
  const [selected, setSelected] = useState<SelectedItem>(null);
  return (
    <SelectedItemContext.Provider value={{ selected, setSelected }}>
      {children}
    </SelectedItemContext.Provider>
  );
};

export const useSelectedItem = () => {
  const ctx = useContext(SelectedItemContext);
  if (!ctx) throw new Error('useSelectedItem must be used within SelectedItemProvider');
  return ctx;
};
