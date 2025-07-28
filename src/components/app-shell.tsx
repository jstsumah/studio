
'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Briefcase,
  Home,
  Download,
  Settings,
  Users,
  Search,
  LogOut,
  User as UserIcon,
  ShieldCheck,
} from 'lucide-react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Logo } from './icons/logo';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

const adminNavItems = [
  { href: '/', icon: Home, label: 'Dashboard' },
  { href: '/assets', icon: Briefcase, label: 'Assets' },
  { href: '/employees', icon: Users, label: 'Employees' },
  { href: '/reports', icon: Download, label: 'Reports' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

function MainSidebar() {
  const pathname = usePathname();
  const { open } = useSidebar();
  const { user, isAdmin } = useAuth();
  
  const employeeNavItems = [
      { href: '/', icon: Home, label: 'Dashboard' },
      { href: `/employees/${user?.id}`, icon: UserIcon, label: 'My Profile & Assets' },
  ];

  const navItems = isAdmin ? adminNavItems : employeeNavItems;

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="h-14 justify-center">
        <Logo className="size-6 text-primary" />
        <span
          className={cn(
            'text-lg font-semibold text-foreground font-headline',
            !open &&
              'group-data-[collapsible=icon]/sidebar-wrapper:opacity-0 group-data-[collapsible=icon]/sidebar-wrapper:w-0'
          )}
        >
          AssetWise
        </span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}

function Header() {
  const { logout, user, isAdmin } = useAuth();
  const router = useRouter();
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const searchQuery = formData.get('search') as string;
    if (searchQuery) {
        router.push(`/assets?search=${encodeURIComponent(searchQuery)}`);
    }
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="w-full flex-1">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              name="search"
              placeholder="Search assets..."
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
              disabled={!isAdmin}
            />
          </div>
        </form>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatarUrl || undefined} alt={user?.name ?? 'User'} />
              <AvatarFallback>{userInitial}</AvatarFallback>
            </Avatar>
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="flex items-center gap-2">
            <span>My Account</span>
            {isAdmin && <ShieldCheck className="h-4 w-4 text-primary" />}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
           <DropdownMenuItem asChild>
            <Link href={`/employees/${user?.id}`}>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>My Profile</span>
            </Link>
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => logout()}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset className="bg-background">
        <Header />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
