import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import clsx from 'clsx';
import { Church, LogOut, Menu, X, ChevronDown, Bell, User } from 'lucide-react';
import BottomNav from './BottomNav';
import { navigation, sectionLabels } from '@/lib/navigation';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl z-50 animate-slide-in">
            <SidebarContent
              currentPath={location.pathname}
              onClose={() => setSidebarOpen(false)}
              onLogout={handleLogout}
              user={user}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
        <div className="flex flex-col w-full bg-white border-r border-gray-200">
          <SidebarContent
            currentPath={location.pathname}
            onLogout={handleLogout}
            user={user}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-14 px-4 sm:px-6">
            {/* Left: hamburger (mobile) */}
            <button
              className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Center: parish name (mobile) / spacer (desktop) */}
            <h1 className="lg:hidden text-sm font-semibold text-gray-900 truncate mx-2">
              Nossa Paroquia
            </h1>
            <div className="hidden lg:block flex-1" />

            {/* Right: notification + avatar */}
            <div className="flex items-center gap-2">
              <Link
                to="/notificacoes"
                className="relative p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Notificacoes"
              >
                <Bell className="h-5 w-5" />
              </Link>

              {/* User menu */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-label="Menu do usuario"
                >
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:block max-w-[120px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown className="h-4 w-4 hidden sm:block" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                      <div className="p-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <Link
                        to="/perfil"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        Meu Perfil
                      </Link>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sair
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <BottomNav currentPath={location.pathname} />
    </div>
  );
}

// ─── Sidebar Content ────────────────────────────────────────────

interface SidebarContentProps {
  currentPath: string;
  onClose?: () => void;
  onLogout: () => void;
  user: import('@/types').User | null;
}

function SidebarContent({ currentPath, onClose, onLogout, user }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 h-16 px-4 border-b border-gray-200">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 rounded-full bg-primary-500 flex items-center justify-center shrink-0">
            <Church className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
              Nossa Paroquia
            </p>
            <p className="text-xs text-gray-500 leading-tight">
              Membro
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navigation.map((item, index) => {
          const showSectionLabel = index === 0 || navigation[index - 1].section !== item.section;

          const isActive =
            currentPath === item.href ||
            (item.href !== '/' && currentPath.startsWith(item.href));

          return (
            <div key={item.href}>
              {showSectionLabel && (
                <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold px-3 pt-4 pb-1.5 first:pt-0">
                  {sectionLabels[item.section]}
                </p>
              )}
              <Link
                to={item.href}
                onClick={onClose}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100',
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.name}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Footer with user info */}
      <div className="shrink-0 border-t border-gray-200 p-3">
        <div className="flex items-center gap-3 px-2 py-1.5 mb-1">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="h-8 w-8 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-medium shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </div>
  );
}
