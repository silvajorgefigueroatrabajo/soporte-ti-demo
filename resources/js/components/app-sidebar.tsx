import { Link, usePage } from '@inertiajs/react';
import {
    Building2,
    BookOpen,
    ClipboardList,
    IdCard,
    LayoutDashboard,
    PlusCircle,
    Settings,
    ScrollText,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as centersIndex } from '@/routes/centers';
import { index as driversIndex } from '@/routes/drivers';
import { index as guidesIndex } from '@/routes/guides';
import { edit as editProfile } from '@/routes/profile';
import {
    create as createSupportCase,
    index as supportCaseIndex,
} from '@/routes/support-cases';
import type { Auth, NavItem } from '@/types';

const footerNavItems: NavItem[] = [];
export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const mainNavItems: NavItem[] = [
        { title: 'Dashboard', href: dashboard(), icon: LayoutDashboard },
        { title: 'Laboratorio demo', href: '/showcase', icon: LayoutDashboard },
        ...(auth.user.role === 'technician'
            ? [
                  {
                      title: 'Registrar caso',
                      href: createSupportCase(),
                      icon: PlusCircle,
                  },
              ]
            : []),
        { title: 'Historial', href: supportCaseIndex(), icon: ClipboardList },
        { title: 'Centros', href: centersIndex(), icon: Building2 },
        ...(auth.user.role === 'technician'
            ? [{ title: 'Conductores', href: driversIndex(), icon: IdCard }]
            : []),
        { title: 'Guías', href: guidesIndex(), icon: BookOpen },
        ...(auth.user.is_admin
            ? [
                  { title: 'Bitácora', href: '/activity', icon: ScrollText },
                  { title: 'Usuarios', href: '/users', icon: Users },
              ]
            : []),
        ...(auth.user.role === 'technician'
            ? [
                  {
                      title: 'Configuración',
                      href: editProfile(),
                      icon: Settings,
                  },
              ]
            : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>
            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
