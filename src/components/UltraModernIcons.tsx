import React from 'react';
import { 
  Zap, 
  Shield, 
  Cpu, 
  Globe, 
  Smartphone, 
  CreditCard, 
  TrendingUp, 
  Database, 
  Settings, 
  User, 
  Bell, 
  Search,
  Menu,
  X,
  ArrowRight,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Send,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Info,
  Star,
  Heart,
  Bookmark,
  Share,
  MoreVertical,
  Plus,
  Minus,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Link2,
  Home,
  Building,
  Briefcase,
  GraduationCap,
  Car,
  Plane,
  ShoppingCart,
  Gift,
  Camera,
  Image,
  Video,
  Music,
  FileText,
  Folder,
  Archive,
  Cloud,
  HardDrive,
  Wifi,
  Bluetooth,
  Battery,
  Power,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Filter,
  Grid,
  List,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Copy,
  Clipboard,
  Save,
  ExternalLink,
  Hash,
  AtSign,
  Percent,
  DollarSign,
  Euro,
  PoundSterling,
  Target,
  Award,
  Trophy,
  Medal,
  Flag,
  Compass,
  Navigation,
  Route,
  Layers,
  BarChart3,
  PieChart,
  LineChart,
  Activity
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface ModernIconProps {
  size?: number;
  className?: string;
  color?: string;
  glowEffect?: boolean;
}

// High-tech modern banking icons with enhanced visual effects
export const ModernBankingIcons = {
  // Core Banking
  Account: ({ size = 24, className = "", glowEffect = false }: ModernIconProps) => (
    <div className={`relative ${className}`}>
      <User 
        size={size} 
        className={`${glowEffect ? 'drop-shadow-[0_0_8px_rgba(54,121,245,0.8)]' : ''} transition-all duration-300`}
      />
      {glowEffect && <div className="absolute inset-0 bg-primary/20 rounded-full blur-sm -z-10"></div>}
    </div>
  ),
  
  Transfer: ({ size = 24, className = "", glowEffect = false }: ModernIconProps) => (
    <div className={`relative ${className}`}>
      <Zap 
        size={size} 
        className={`${glowEffect ? 'drop-shadow-[0_0_8px_rgba(142,196,115,0.8)]' : ''} transition-all duration-300`}
      />
      {glowEffect && <div className="absolute inset-0 bg-secondary/20 rounded-full blur-sm -z-10"></div>}
    </div>
  ),
  
  Security: ({ size = 24, className = "", glowEffect = false }: ModernIconProps) => (
    <div className={`relative ${className}`}>
      <Shield 
        size={size} 
        className={`${glowEffect ? 'drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]' : ''} transition-all duration-300`}
      />
      {glowEffect && <div className="absolute inset-0 bg-accent/20 rounded-full blur-sm -z-10"></div>}
    </div>
  ),
  
  Analytics: ({ size = 24, className = "", glowEffect = false }: ModernIconProps) => (
    <div className={`relative ${className}`}>
      <BarChart3 
        size={size} 
        className={`${glowEffect ? 'drop-shadow-[0_0_8px_rgba(54,121,245,0.8)]' : ''} transition-all duration-300`}
      />
      {glowEffect && <div className="absolute inset-0 bg-primary/20 rounded-full blur-sm -z-10"></div>}
    </div>
  ),
  
  Mobile: ({ size = 24, className = "", glowEffect = false }: ModernIconProps) => (
    <div className={`relative ${className}`}>
      <Smartphone 
        size={size} 
        className={`${glowEffect ? 'drop-shadow-[0_0_8px_rgba(142,196,115,0.8)]' : ''} transition-all duration-300`}
      />
      {glowEffect && <div className="absolute inset-0 bg-secondary/20 rounded-full blur-sm -z-10"></div>}
    </div>
  ),
  
  Cards: ({ size = 24, className = "", glowEffect = false }: ModernIconProps) => (
    <div className={`relative ${className}`}>
      <CreditCard 
        size={size} 
        className={`${glowEffect ? 'drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]' : ''} transition-all duration-300`}
      />
      {glowEffect && <div className="absolute inset-0 bg-accent/20 rounded-full blur-sm -z-10"></div>}
    </div>
  ),
  
  Investments: ({ size = 24, className = "", glowEffect = false }: ModernIconProps) => (
    <div className={`relative ${className}`}>
      <TrendingUp 
        size={size} 
        className={`${glowEffect ? 'drop-shadow-[0_0_8px_rgba(54,121,245,0.8)]' : ''} transition-all duration-300`}
      />
      {glowEffect && <div className="absolute inset-0 bg-primary/20 rounded-full blur-sm -z-10"></div>}
    </div>
  ),
  
  Database: ({ size = 24, className = "", glowEffect = false }: ModernIconProps) => (
    <div className={`relative ${className}`}>
      <Database 
        size={size} 
        className={`${glowEffect ? 'drop-shadow-[0_0_8px_rgba(142,196,115,0.8)]' : ''} transition-all duration-300`}
      />
      {glowEffect && <div className="absolute inset-0 bg-secondary/20 rounded-full blur-sm -z-10"></div>}
    </div>
  ),
  
  // UI Elements
  Menu: ({ size = 24, className = "", glowEffect = false }: ModernIconProps) => (
    <div className={`relative ${className}`}>
      <Menu 
        size={size} 
        className={`${glowEffect ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : ''} transition-all duration-300`}
      />
      {glowEffect && <div className="absolute inset-0 bg-foreground/20 rounded-full blur-sm -z-10"></div>}
    </div>
  ),
  
  Close: ({ size = 24, className = "", glowEffect = false }: ModernIconProps) => (
    <div className={`relative ${className}`}>
      <X 
        size={size} 
        className={`${glowEffect ? 'drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : ''} transition-all duration-300`}
      />
      {glowEffect && <div className="absolute inset-0 bg-destructive/20 rounded-full blur-sm -z-10"></div>}
    </div>
  ),
  
  Notifications: ({ size = 24, className = "", glowEffect = false }: ModernIconProps) => (
    <div className={`relative ${className}`}>
      <Bell 
        size={size} 
        className={`${glowEffect ? 'drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]' : ''} transition-all duration-300`}
      />
      {glowEffect && <div className="absolute inset-0 bg-accent/20 rounded-full blur-sm -z-10"></div>}
    </div>
  ),
  
  Settings: ({ size = 24, className = "", glowEffect = false }: ModernIconProps) => (
    <div className={`relative ${className}`}>
      <Settings 
        size={size} 
        className={`${glowEffect ? 'drop-shadow-[0_0_8px_rgba(142,196,115,0.8)]' : ''} transition-all duration-300 animate-spin-slow`}
      />
      {glowEffect && <div className="absolute inset-0 bg-secondary/20 rounded-full blur-sm -z-10"></div>}
    </div>
  ),
};

// Export individual icons for easier access
export const {
  Account: AccountIcon,
  Transfer: TransferIcon,
  Security: SecurityIcon,
  Analytics: AnalyticsIcon,
  Mobile: MobileIcon,
  Cards: CardsIcon,
  Investments: InvestmentsIcon,
  Database: DatabaseIcon,
  Menu: MenuIcon,
  Close: CloseIcon,
  Notifications: NotificationsIcon,
  Settings: SettingsIcon,
} = ModernBankingIcons;

// Ultra-modern animated icon wrapper component
export const UltraModernIcon: React.FC<{
  icon: LucideIcon;
  size?: number;
  className?: string;
  animated?: boolean;
  glowColor?: string;
}> = ({ 
  icon: Icon, 
  size = 24, 
  className = "", 
  animated = false,
  glowColor = "rgba(54,121,245,0.8)"
}) => {
  return (
    <div className={`relative group ${className}`}>
      <Icon 
        size={size}
        className={`
          transition-all duration-300 
          ${animated ? 'group-hover:scale-110 group-hover:rotate-3' : ''}
          drop-shadow-lg
        `}
        style={{
          filter: `drop-shadow(0 0 8px ${glowColor})`,
        }}
      />
      <div 
        className="absolute inset-0 rounded-full blur-md -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`
        }}
      ></div>
    </div>
  );
};