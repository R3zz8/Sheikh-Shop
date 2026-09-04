import {
  Smartphone,
  ShoppingBag,
  Watch,
  Sparkles,
  Home,
  Shield,
  Code2,
  Cpu,
  type LucideIcon
} from 'lucide-react';

export interface RadialCategory {
  id: string;
  name: string;
  shortName: string;
  href: string;
  icon: LucideIcon;
  angleDeg: number; // 0deg at Top (12:00), increasing clockwise
  color: string;
}

export const SHEIKH_RADIAL_CATEGORIES: RadialCategory[] = [
  {
    id: 'digital',
    name: 'شیخ دیجیتال',
    shortName: 'دیجیتال',
    href: '/sheikh-digital',
    icon: Smartphone,
    angleDeg: 0, // 12:00 (Top)
    color: '#fbbf24',
  },
  {
    id: 'food',
    name: 'مواد غذایی شیخ',
    shortName: 'مواد غذایی',
    href: '/sheikh-food',
    icon: ShoppingBag,
    angleDeg: 45, // 1:30
    color: '#d97706',
  },
  {
    id: 'smart',
    name: 'شیخ اسمارت',
    shortName: 'اسمارت',
    href: '/categories/sheikh-smart',
    icon: Watch,
    angleDeg: 90, // 3:00 (Right)
    color: '#f59e0b',
  },
  {
    id: 'nicotine',
    name: 'شیخ نیکوتین',
    shortName: 'نیکوتین',
    href: '/sheikh-nicotine',
    icon: Sparkles,
    angleDeg: 135, // 4:30
    color: '#fb7316',
  },
  {
    id: 'home',
    name: 'لوازم خانگی شیخ',
    shortName: 'لوازم خانگی',
    href: '/sheikh-home',
    icon: Home,
    angleDeg: 180, // 6:00 (Bottom)
    color: '#eab308',
  },
  {
    id: 'grooming',
    name: 'شیخ گرومینگ',
    shortName: 'گرومینگ',
    href: '/sheikh-grooming',
    icon: Shield,
    angleDeg: 225, // 7:30
    color: '#f59e0b',
  },
  {
    id: 'web',
    name: 'شیخ وب',
    shortName: 'وب',
    href: '/contact',
    icon: Code2,
    angleDeg: 270, // 9:00 (Left)
    color: '#fbbf24',
  },
  {
    id: 'nava',
    name: 'شیخ نوا',
    shortName: 'نوا',
    href: '/tech-products',
    icon: Cpu,
    angleDeg: 315, // 10:30
    color: '#f59e0b',
  },
];
