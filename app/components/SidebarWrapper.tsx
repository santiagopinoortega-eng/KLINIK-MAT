'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { useSidebar } from '@/app/context/SidebarContext';
import { useEffect } from 'react';

export default function SidebarWrapper() {
  const pathname = usePathname();
  const { isCollapsed, getSidebarWidth } = useSidebar();

  // Determine sidebar variant based on current path
  const getSidebarVariant = () => {
    // No sidebar for these pages
    if (!pathname || 
        pathname === '/' || 
        pathname.startsWith('/login') || 
        pathname.startsWith('/sign-in') ||
        pathname.startsWith('/sign-up') ||
        pathname.startsWith('/recursos')) {
      return 'none';
    }

    // Compact sidebar for individual case pages
    if (pathname.match(/^\/casos\/[^/]+$/)) {
      return 'compact';
    }

    // Mini sidebar for favorites and progress pages
    if (pathname === '/favoritos' || pathname === '/mi-progreso') {
      return 'mini';
    }

    // Full sidebar for cases listing and areas
    if (pathname.startsWith('/casos') || pathname.startsWith('/areas')) {
      return 'full';
    }

    // Default: no sidebar
    return 'none';
  };

  const variant = getSidebarVariant();

  // Apply CSS variable for sidebar width so pages can adjust
  useEffect(() => {
    if (variant === 'none') {
      document.documentElement.style.setProperty('--sidebar-width', '0px');
    } else if (variant === 'full') {
      document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '4rem' : '16rem');
    } else {
      document.documentElement.style.setProperty('--sidebar-width', '16rem');
    }
  }, [variant, isCollapsed]);

  return <Sidebar variant={variant} />;
}
