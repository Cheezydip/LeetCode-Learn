import { create } from 'zustand';

export const useSearchStore = create((set) => ({
  isOpen: false,
  initialQuery: '',
  openSearch: (query = '') => set({ isOpen: true, initialQuery: query }),
  closeSearch: () => set({ isOpen: false, initialQuery: '' }),
  toggleSearch: () => set((state) => ({ isOpen: !state.isOpen })),
}));
