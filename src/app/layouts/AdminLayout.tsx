import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, LogOut, GraduationCap, FolderTree, ListTree } from 'lucide-react';
import { adminAuthApi } from '@/api/admin-auth.api';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

const NAV = [
  { to: ROUTES.DASHBOARD, label: 'Overview',  icon: LayoutDashboard, end: true  },
  { to: ROUTES.QUESTIONS, label: 'Questions', icon: BookOpen,        end: false },
  { to: ROUTES.USERS,     label: 'Users',     icon: Users,           end: false },
  { to: ROUTES.EXAMS,     label: 'Exams',     icon: GraduationCap,   end: false },
  { to: ROUTES.SUBJECTS,  label: 'Subjects',  icon: FolderTree,      end: false },
  { to: ROUTES.TOPICS,    label: 'Topics',    icon: ListTree,        end: false },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const admin = useAuthStore(s => s.admin);
  const clear = useAuthStore(s => s.clear);

  async function handleLogout() {
    try {
      await adminAuthApi.logout();
    } catch { /* ignore */ }
    clear();
    navigate(ROUTES.LOGIN, { replace: true });
  }

  return (
    <div className="min-h-svh flex bg-muted/20">
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r bg-background">
        <div className="px-6 py-5 border-b">
          <div className="text-sm font-semibold tracking-tight">oneMark Admin</div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                )
              }
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t">
          <div className="px-3 py-2 mb-1">
            <div className="text-sm font-medium truncate">{admin?.name}</div>
            <div className="text-xs text-muted-foreground truncate">{admin?.email}</div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="px-6 py-6 md:px-8 md:py-8 max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
