import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MenuState {
  selectedPath: string;
  openMenus: string[];
  setSelectedPath: (path: string) => void;
  toggleMenu: (menuId: string) => void;
  closeOtherMenus: (menuId: string) => void;
  isMenuOpen: (menuId: string) => boolean;
}

export const useMenuState = create<MenuState>()(
  persist(
    (set, get) => ({
      selectedPath: '/',
      openMenus: [],
      setSelectedPath: (path) => set({ selectedPath: path }),
      toggleMenu: (menuId) => {
        const { openMenus } = get();
        const isOpen = openMenus.includes(menuId);
        
        if (isOpen) {
          // If menu is open, close it
          set({ openMenus: openMenus.filter(id => id !== menuId) });
        } else {
          // If menu is closed, close others and open this one
          set({ openMenus: [menuId] });
        }
      },
      closeOtherMenus: (menuId) => {
        set({ openMenus: [menuId] });
      },
      isMenuOpen: (menuId) => get().openMenus.includes(menuId),
    }),
    {
      name: 'menu-storage',
    }
  )
);