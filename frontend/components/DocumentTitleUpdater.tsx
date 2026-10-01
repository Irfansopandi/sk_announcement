"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function DocumentTitleUpdater() {
  const pathname = usePathname();

  useEffect(() => {
    let title = 'ISKR - Dashboard';
    
    if (pathname.startsWith('/admin')) {
      if (pathname.includes('/announcements')) {
        title = 'ISKR - Admin panel - SK';
      } else if (pathname.includes('/notulensi')) {
        title = 'ISKR - Admin panel - Rapat';
      } else {
        title = 'ISKR - Admin panel - Dashboard';
      }
    } else if (pathname.startsWith('/login')) {
      title = 'ISKR - Login';
    } else {
      // Public pages
      if (pathname.includes('/pengumuman')) {
        title = 'ISKR - SK';
      } else if (pathname.includes('/notulensi')) {
        title = 'ISKR - Rapat';
      } else {
        title = 'ISKR - Dashboard';
      }
    }
    
    document.title = title;
  }, [pathname]);

  return null;
}
