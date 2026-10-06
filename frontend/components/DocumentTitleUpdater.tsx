"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function DocumentTitleUpdater() {
  const pathname = usePathname();

  useEffect(() => {
    let title = 'ISURA - Dashboard';
    
    if (pathname.startsWith('/admin')) {
      if (pathname.includes('/announcements')) {
        title = 'ISURA - Admin panel - SK';
      } else if (pathname.includes('/notulensi')) {
        title = 'ISURA - Admin panel - Rapat';
      } else {
        title = 'ISURA - Admin panel - Dashboard';
      }
    } else if (pathname.startsWith('/login')) {
      title = 'ISURA - Login';
    } else {
      // Public pages
      if (pathname.includes('/pengumuman')) {
        title = 'ISURA - SK';
      } else if (pathname.includes('/notulensi')) {
        title = 'ISURA - Rapat';
      } else {
        title = 'ISURA - Dashboard';
      }
    }
    
    document.title = title;
  }, [pathname]);

  return null;
}
