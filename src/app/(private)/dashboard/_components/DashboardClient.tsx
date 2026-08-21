'use client';

import React from 'react';
import Link from 'next/link';
import { useRequireRole } from '@/hooks/useRBAC';
import { Package, Users, FileText, CreditCard, BarChart3, MessageSquare, Sliders, FolderTree } from 'lucide-react';

export default function DashboardClient() {
  const hasAccess = useRequireRole(['ADMIN', 'SUPERADMIN']);

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">
                        You don&apos;t have permission to access this page. Please contact an administrator.
          </p>
        </div>
      </div>
    );
  }

  const dashboardCards = [
    {
      title: 'دسته‌بندی‌ها (Categories)',
      description: 'مدیریت دسته‌بندی‌های اصلی و تصاویر آنلاین',
      href: '/dashboard/categories',
      icon: FolderTree,
    },
    {
      title: 'مدیریت کروسل (Carousel)',
      description: 'مدیریت اسلایدر و بنرهای تبلیغاتی موبایل',
      href: '/dashboard/mobile-carousel',
      icon: Sliders,
    },
    {
      title: 'Products',
      description: 'Manage your products',
      href: '/dashboard/products',
      icon: Package,
    },
    {
      title: 'Reviews',
      description: 'Manage and moderate product reviews',
      href: '/dashboard/reviews',
      icon: MessageSquare,
    },
    {
      title: 'Users',
      description: 'Manage user accounts',
      href: '/dashboard/users',
      icon: Users,
    },
    {
      title: 'Articles',
      description: 'Manage blog articles',
      href: '/dashboard/articles',
      icon: FileText,
    },
    {
      title: 'Transactions',
      description: 'View payment transactions',
      href: '/dashboard/transactions',
      icon: CreditCard,
    },
    {
      title: 'Payment Analytics',
      description: 'Analytics and reports',
      href: '/dashboard/payment-analytics',
      icon: BarChart3,
    },
    {
      title: 'Audit Logs',
      description: 'View system activity',
      href: '/dashboard/audit-logs',
      icon: FileText,
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-lg font-semibold group-hover:text-amber-600 transition-colors">
                  {card.title}
                </h2>
                <Icon className="h-5 w-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
              </div>
              <p className="text-gray-600">{card.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
