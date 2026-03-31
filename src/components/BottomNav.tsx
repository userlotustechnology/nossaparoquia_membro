import { useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import {
  Home,
  BookOpen,
  Users,
  Calendar,
  Menu,
  X,
} from 'lucide-react';
import { navigation, type NavItem } from '@/lib/navigation';

interface BottomNavProps {
  currentPath: string;
}

const tabs = [
  { name: 'Início', href: '/', icon: Home },
  { name: 'Oração', href: '/oracoes', icon: BookOpen },
  { name: 'Comunidade', href: '/comunidade', icon: Users },
  { name: 'Eventos', href: '/eventos', icon: Calendar },
];

// Items to show in the "Mais" drawer (everything not already in main tabs)
const mainTabPaths = new Set(tabs.map((t) => t.href));
const moreItems = navigation.filter((item) => !mainTabPaths.has(item.href));

export default function BottomNav({ currentPath }: BottomNavProps) {
  const [moreOpen, setMoreOpen] = useState(false);

  const isTabActive = (href: string) =>
    currentPath === href || (href !== '/' && currentPath.startsWith(href));

  const isMoreActive =
    !tabs.some((t) => isTabActive(t.href)) && !moreOpen;

  return (
    <>
      {/* "Mais" drawer overlay */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMoreOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[70vh] flex flex-col animate-slide-up">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
              <h3 className="text-sm font-semibold text-gray-900">
                Mais opções
              </h3>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer items */}
            <div className="flex-1 overflow-y-auto px-2 py-2">
              <MoreDrawerItems
                items={moreItems}
                currentPath={currentPath}
                onClose={() => setMoreOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 lg:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-1">
          {tabs.map((tab) => {
            const active = isTabActive(tab.href);
            return (
              <Link
                key={tab.href}
                to={tab.href}
                className={clsx(
                  'flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors',
                  active
                    ? 'text-primary-500'
                    : 'text-gray-400 hover:text-gray-600',
                )}
              >
                <tab.icon
                  className={clsx('h-5 w-5', active && 'stroke-[2.5]')}
                />
                <span className="text-[10px] font-medium leading-tight">
                  {tab.name}
                </span>
              </Link>
            );
          })}

          {/* "Mais" button */}
          <button
            onClick={() => setMoreOpen(true)}
            className={clsx(
              'flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors',
              isMoreActive || moreOpen
                ? 'text-primary-500'
                : 'text-gray-400 hover:text-gray-600',
            )}
          >
            <Menu
              className={clsx(
                'h-5 w-5',
                (isMoreActive || moreOpen) && 'stroke-[2.5]',
              )}
            />
            <span className="text-[10px] font-medium leading-tight">Mais</span>
          </button>
        </div>
      </nav>
    </>
  );
}

// ─── More Drawer Items (grouped by section) ─────────────────────

interface MoreDrawerItemsProps {
  items: NavItem[];
  currentPath: string;
  onClose: () => void;
}

function MoreDrawerItems({ items, currentPath, onClose }: MoreDrawerItemsProps) {
  return (
    <div className="space-y-0.5">
      {items.map((item, index) => {
        const showSection = index === 0 || items[index - 1].section !== item.section;

        const isActive =
          currentPath === item.href ||
          (item.href !== '/' && currentPath.startsWith(item.href));

        return (
          <div key={item.href}>
            {showSection && (
              <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold px-3 pt-3 pb-1">
                {item.section}
              </p>
            )}
            <Link
              to={item.href}
              onClick={onClose}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-700 hover:bg-gray-50',
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.name}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
