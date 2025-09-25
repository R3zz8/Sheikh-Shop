'use client';

import { useState } from 'react';
import { UserCircle2, User2, Smile, Crown, Shield, Settings, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  email: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  profilePicture?: string | null;
  role: 'USER' | 'AUTHOR' | 'EDITOR' | 'MODERATOR' | 'ADMIN' | 'SUPERADMIN' | 'SYSTEM';
}

interface UserBadgeProps {
  user: User;
  onLogout?: () => void;
  className?: string;
  variant?: 'default' | 'compact' | 'mobile';
}

export default function UserBadge({
  user,
  onLogout,
  className,
  variant = 'default'
}: UserBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Get display name (username, full name, or email fallback)
  const getDisplayName = () => {
    if (user.username) return user.username;
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    return user.email.split('@')[0]; // Use email prefix as fallback
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.firstName) {
      return user.firstName[0]?.toUpperCase() || 'U';
    }
    if (user.username) {
      return user.username[0]?.toUpperCase() || 'U';
    }
    return user.email[0]?.toUpperCase() || 'U';
  };

  // Get gender-based icon
  const getGenderIcon = () => {
    switch (user.gender) {
      case 'MALE':
        return User2;
      case 'FEMALE':
        return UserCircle2;
      case 'OTHER':
        return Smile;
      default:
        return UserCircle2;
    }
  };

  // Get role-based styling and icon
  const getRoleInfo = () => {
    switch (user.role) {
      case 'SUPERADMIN':
        return { icon: Crown, color: 'text-amber-400', bg: 'bg-amber-400/10', label: 'Super Admin' };
      case 'ADMIN':
        return { icon: Shield, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Administrator' };
      case 'MODERATOR':
        return { icon: Shield, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Moderator' };
      case 'EDITOR':
        return { icon: Settings, color: 'text-green-400', bg: 'bg-green-400/10', label: 'Editor' };
      default:
        return { icon: User2, color: 'text-gray-400', bg: 'bg-gray-400/10', label: 'User' };
    }
  };

  const roleInfo = getRoleInfo();
  const GenderIcon = getGenderIcon();
  const displayName = getDisplayName();
  const initials = getInitials();

  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 w-8 rounded-full p-0',
                'bg-white/8 backdrop-blur-sm border border-white/20',
                'hover:bg-white/12 hover:border-white/30',
                'transition-all duration-300',
                className
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profilePicture || undefined} alt={displayName} />
                <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-400 text-white text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-amber-950/95 backdrop-blur-xl border border-amber-200/20">
            <div className="flex items-center gap-2">
              <GenderIcon className="w-4 h-4 text-amber-300" />
              <span className="text-white font-medium">{displayName}</span>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'mobile') {
    return (
      <div className={cn(
        'flex items-center gap-3 p-4 bg-white/8 backdrop-blur-sm rounded-xl border border-white/20',
        'transition-all duration-300 hover:bg-white/12',
        className
      )}>
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.profilePicture || undefined} alt={displayName} />
          <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-400 text-white font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate">{displayName}</p>
          <div className="flex items-center gap-2">
            <GenderIcon className="w-3 h-3 text-amber-300" />
            <span className="text-gray-400 text-sm truncate">{roleInfo.label}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-xl',
            'bg-white/8 backdrop-blur-sm border border-white/20',
            'hover:bg-white/12 hover:border-white/30',
            'transition-all duration-300',
            'focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2',
            className
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profilePicture || undefined} alt={displayName} />
            <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-400 text-white text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="hidden sm:flex flex-col items-start">
            <span className="text-white font-medium text-sm leading-tight">
              {displayName}
            </span>
            <div className="flex items-center gap-1">
              <GenderIcon className="w-3 h-3 text-amber-300" />
              <span className="text-gray-400 text-xs">{roleInfo.label}</span>
            </div>
          </div>

          <div className={cn(
            'w-2 h-2 rounded-full',
            roleInfo.bg,
            roleInfo.color.replace('text-', 'border-')
          )} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className={cn(
          'w-64 bg-amber-950/95 backdrop-blur-xl border border-amber-200/20',
          'shadow-2xl shadow-black/20'
        )}
      >
        <DropdownMenuLabel className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.profilePicture || undefined} alt={displayName} />
              <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-400 text-white font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{displayName}</p>
              <p className="text-gray-400 text-sm truncate">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <GenderIcon className="w-3 h-3 text-amber-300" />
                <span className={cn('text-xs px-2 py-1 rounded-full', roleInfo.bg, roleInfo.color)}>
                  {roleInfo.label}
                </span>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-amber-200/20" />

        <DropdownMenuItem className="flex items-center gap-3 p-3 text-gray-300 hover:text-white hover:bg-white/8 transition-colors">
          <Settings className="w-4 h-4" />
          <span>Account Settings</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center gap-3 p-3 text-gray-300 hover:text-white hover:bg-white/8 transition-colors">
          <Shield className="w-4 h-4" />
          <span>Security</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-amber-200/20" />

        <DropdownMenuItem
          onClick={onLogout}
          className="flex items-center gap-3 p-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
