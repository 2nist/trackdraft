import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Music, 
  Layers, 
  FileText, 
  Mic, 
  Settings,
  Sparkles
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/harmony', icon: Music, label: 'Harmony' },
  { path: '/structure', icon: Layers, label: 'Structure' },
  { path: '/lyrics', icon: FileText, label: 'Lyrics' },
  { path: '/melody', icon: Mic, label: 'Melody' },
  { path: '/finishing', icon: Sparkles, label: 'Finishing' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-40 bg-surface-1 border-r border-surface-2 flex flex-col">
      <div className="h-16 px-3 border-b border-surface-2 flex items-center justify-center">
        <img 
          src="/logo.png" 
          alt="TRACKdrafT Logo" 
          className="h-12 w-auto"
        />
      </div>
      
      <nav className="flex-1 p-2.5">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-all ${
                    isActive
                      ? 'bg-accent/15 text-white border-l-2 border-accent'
                      : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary border-l-2 border-transparent'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium text-sm tracking-wide">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-2.5 border-t border-surface-2">
        <Link
          to="/settings"
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-all border-l-2 border-transparent"
        >
          <Settings size={18} />
          <span className="font-medium text-sm tracking-wide">Settings</span>
        </Link>
      </div>
    </aside>
  );
}

