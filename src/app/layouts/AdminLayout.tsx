import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Users, LogOut, GraduationCap, FolderTree, ListTree, ChevronRight,
} from 'lucide-react';
import { adminAuthApi } from '@/api/admin-auth.api';
import { useAuthStore } from '@/store/useAuthStore';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const CONTENT_NAV = [
  { to: ROUTES.EXAMS, label: 'Exams', icon: GraduationCap },
  { to: ROUTES.SUBJECTS, label: 'Subjects', icon: FolderTree },
  { to: ROUTES.TOPICS, label: 'Topics', icon: ListTree },
  { to: ROUTES.QUESTIONS, label: 'Questions', icon: BookOpen },
];

const MANAGE_NAV = [
  { to: ROUTES.USERS, label: 'Users', icon: Users },
];

function NavItem({ to, label, Icon }: { to: string; label: string; Icon: React.ElementType }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
          isActive
            ? 'bg-app-bg text-app-text font-semibold border border-app-border shadow-sm'
            : 'text-app-muted hover:text-app-text hover:bg-app-accent',
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </NavLink>
  );
}

export function AdminLayout() {
  const navigate = useNavigate();
  const admin = useAuthStore(s => s.admin);
  const clear = useAuthStore(s => s.clear);
  const [logoutOpen, setLogoutOpen] = useState(false);

  async function doLogout() {
    try { await adminAuthApi.logout(); } catch { /* ignore */ }
    clear();
    navigate(ROUTES.LOGIN, { replace: true });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-app-bg font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-app-border bg-white h-full">
        <div className="px-5 py-4 border-b border-app-border flex items-center gap-2.5">
          <div className="h-7 w-7 rounded bg-app-text flex items-center justify-center shrink-0">
            <span className="text-white text-[11px] font-bold">OM</span>
          </div>
          <div>
            <div className="text-sm font-bold text-app-text tracking-tight">oneMark</div>
            <div className="text-[9px] font-bold text-app-muted uppercase tracking-widest">Admin Panel</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
          <NavLink
            to={ROUTES.DASHBOARD}
            end
            className={({ isActive }) =>
              cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive ? 'bg-app-bg text-app-text font-semibold border border-app-border shadow-sm' : 'text-app-muted hover:text-app-text hover:bg-app-accent')
            }
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            Overview
          </NavLink>

          <div className="pt-3 pb-1 px-3 text-[10px] font-bold text-app-muted uppercase tracking-widest">Content</div>
          {CONTENT_NAV.map(n => <NavItem key={n.to} to={n.to} label={n.label} Icon={n.icon} />)}

          <div className="pt-3 pb-1 px-3 text-[10px] font-bold text-app-muted uppercase tracking-widest">Management</div>
          {MANAGE_NAV.map(n => <NavItem key={n.to} to={n.to} label={n.label} Icon={n.icon} />)}
        </nav>

        <div className="border-t border-app-border p-3 space-y-1">
          <div className="px-3 py-2">
            <div className="text-sm font-semibold text-app-text truncate">{admin?.name ?? 'Admin'}</div>
            <div className="text-xs text-app-muted truncate">{admin?.email}</div>
          </div>
          <button
            onClick={() => setLogoutOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* TopBar */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-app-border bg-white shrink-0">
          <div className="text-sm text-app-muted flex items-center gap-1.5">
            <span className="font-semibold text-app-text">oneMark</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-app-bg border border-app-border flex items-center justify-center text-xs font-bold text-app-text">
              {(admin?.name ?? 'A').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 max-w-[1500px]">
            <Outlet />
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="Sign out"
        description="Are you sure you want to sign out?"
        confirmText="Sign out"
        variant="destructive"
        onConfirm={doLogout}
      />
    </div>
  );
}
