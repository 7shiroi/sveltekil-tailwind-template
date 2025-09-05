import { MenuItemType, UserRole } from "$lib/types/enums";

export interface BaseMenuItem {
  id: string;
  name: string;
  icon: any; // Use any for Svelte 5 component compatibility
  roles?: UserRole[]; // If specified, only users with these roles can see this item
  visible?: boolean; // For dynamic visibility
}

export interface SimpleMenuItem extends BaseMenuItem {
  type: MenuItemType.SIMPLE;
  href: string;
  badge?: string | number; // Optional badge (e.g., notification count)
  external?: boolean; // Opens in new tab
}

export interface MenuSection extends BaseMenuItem {
  type: MenuItemType.SECTION;
  items: MenuSubItem[];
  defaultExpanded?: boolean;
}

export interface MenuDivider {
  type: MenuItemType.DIVIDER;
  id: string;
  label?: string; // Optional label for the divider
}

export interface MenuSubItem {
  id: string;
  name: string;
  icon: any; // Use any for Svelte 5 component compatibility
  href: string;
  badge?: string | number;
  roles?: UserRole[];
  visible?: boolean;
  external?: boolean;
}

export type MenuItem = SimpleMenuItem | MenuSection | MenuDivider;

export interface MenuConfig {
  main: MenuItem[];
  footer: SimpleMenuItem[];
}

// Navigation context for determining active states
export interface NavigationContext {
  currentPath: string;
  userRole?: UserRole;
  badges?: Record<string, string | number>; // Dynamic badges
}
