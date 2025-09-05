import type { MenuConfig } from "$lib/types/menu";
import { MenuItemType, UserRole } from "$lib/utils/enums";

// Import icons from phosphor-svelte
import IconHome from "phosphor-svelte/lib/House";
import IconGear from "phosphor-svelte/lib/Gear";
import IconUsers from "phosphor-svelte/lib/UsersThree";
import IconLock from "phosphor-svelte/lib/Lock";
import IconShieldCheck from "phosphor-svelte/lib/ShieldCheck";

export const menuConfig: MenuConfig = {
  main: [
    {
      type: MenuItemType.SIMPLE,
      id: "dashboard",
      name: "Dashboard",
      icon: IconHome,
      href: "/",
    },
    {
      type: MenuItemType.SECTION,
      id: "parent-menu",
      name: "Parent Menu",
      icon: IconGear,
      defaultExpanded: true,
      items: [
        {
          id: "child-menu",
          name: "Child Menu",
          icon: IconGear,
          href: "/child-menu",
        },
        {
          id: "child-menu-2",
          name: "Child Menu 2",
          icon: IconGear,
          href: "/child-menu-2",
        },
        {
          id: "child-menu-3",
          name: "Child Menu 3",
          icon: IconGear,
          href: "/child-menu-3",
        },
      ],
    },
    {
      type: MenuItemType.DIVIDER,
      id: "divider-menu",
    },
    {
      type: MenuItemType.SIMPLE,
      id: "simple-menu",
      name: "Simple Menu",
      icon: IconUsers,
      href: "/simple-menu",
    },
    {
      type: MenuItemType.SIMPLE,
      id: "simple-menu-2",
      name: "Simple Menu 2",
      icon: IconShieldCheck,
      href: "/simple-menu-2",
    },
  ],
  footer: [
    {
      type: MenuItemType.SIMPLE,
      id: "settings",
      name: "Settings",
      icon: IconGear,
      href: "/settings",
    },
    {
      type: MenuItemType.SIMPLE,
      id: "change-password",
      name: "Change Password",
      icon: IconLock,
      href: "/change-password",
    },
  ],
};

// Helper function to get menu items with future role-based filtering support
export const getFilteredMenuItems = (
  items: MenuConfig["main"],
  userRole?: UserRole
): MenuConfig["main"] => {
  // Currently admin-only, but ready for role-based filtering
  // TODO: When implementing role-based access, use dynamic enum from backend:
  // const roleEnums = await getEnumValues("Role");

  return items;
};

// Helper function to check if a menu item is active
export const isMenuItemActive = (
  href: string,
  currentPath: string
): boolean => {
  if (href === "/") {
    return currentPath === "/";
  }
  return currentPath.startsWith(href);
};

// Helper function to find active menu section
export const getActiveSection = (
  items: MenuConfig["main"],
  currentPath: string
): string | null => {
  for (const item of items) {
    if (item.type === MenuItemType.SECTION) {
      for (const subItem of item.items) {
        if (isMenuItemActive(subItem.href, currentPath)) {
          return item.id;
        }
      }
    }
  }
  return null;
};
