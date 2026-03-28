'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { CategoriesProvider } from '@/contexts/CategoriesContext';
import AdminLayoutWrapper from './AdminLayoutWrapper';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminRootLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  // Don't wrap login page with AdminLayoutWrapper
  if (isLoginPage) {
    return (
      <AdminAuthProvider>
        <CategoriesProvider>
          {children}
        </CategoriesProvider>
      </AdminAuthProvider>
    );
  }

  return (
    <AdminAuthProvider>
      <CategoriesProvider>
        <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
      </CategoriesProvider>
    </AdminAuthProvider>
  );
}
