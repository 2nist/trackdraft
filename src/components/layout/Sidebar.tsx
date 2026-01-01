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
    <aside className="w-64 bg-surface-1 border-r border-surface-2 flex flex-col">
      <div className="p-6 border-b border-surface-2">
        <div className="flex items-center justify-center">
          <img 
            src="/logo.png" 
            alt="TRACKdrafT Logo" 
            className="h-24 w-auto"
          />
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        isActive
          ? 'border-2 border-accent bg-accent/10 text-white'
          : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary border-2 border-transparent'
      }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-surface-2">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
        >
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </Link>
      </div>
    </aside>
  );
}

