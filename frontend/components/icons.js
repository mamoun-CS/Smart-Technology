// Centralized icon exports from lucide-react
// This file re-exports all icons used in the project for better maintainability

export {
  // Navigation & Actions
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  MoreVertical,
  Menu,
  X,
  
  // User & Auth
  User,
  Users,
  Lock,
  Key,
  Mail,
  Phone,
  LogOut,
  
  // Shopping & Commerce
  ShoppingCart,
  ShoppingBag,
  Package,
  Tag,
  Gift,
  DollarSign,
  CreditCard,
  
  // Content & Media
  Heart,
  Star,
  Eye,
  EyeOff,
  Edit,
  Edit2,
  Pencil,
  Trash2,
  Plus,
  Minus,
  Copy,
  Check,
  CheckCircle,
  XCircle,
  Save,
  Upload,
  Palette,
  
  // Communication
  MessageSquare,
  Send,
  Bell,
  
  // Location & Shipping
  Globe,
  MapPin,
  Truck,
  Store,
  
  // Status & Alerts
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  Clock,
  
  // UI Elements
  Search,
  Filter,
  Grid,
  List,
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight,
  Settings,
  
  // Brand & Social
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  
  // Features
  Zap,
  Shield,
  Sparkles,
  LayoutDashboard,
  Layers,
  Share2,
  Calendar,
  Percent,
  BarChart,
  BarChart3,
  PieChart,
  Activity,
  TrendingUp,
} from 'lucide-react';

// Custom WhatsApp icon component
export const Whatsapp = (props) => (
  <svg
    src="https://img.icons8.com/ios/50/whatsapp--v1.png" alt="whatsapp--v1"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-.52-.528-.721-1.013-.201-.482-.28-.892-.3-1.065-.015-.168.03-.168.186-.015.358.299.901.688 1.235.894.485.3 1.04.299 1.345.099.181-.181.571-.598.817-.897.164-.199.437-.249.59-.17.297.148.418.422.656.557.298.173.595.235.835.235.238 0 .476-.015.679-.136.297-.18.522-.495.576-.806.06-.36.06-.75.03-1.065-.03-.297-.147-.546-.255-.728z" />
    <path d="M8.538 10.823c.296.592.856.852 1.478.852.07 0 .14-.005.21-.015.523-.074.972-.193 1.402-.399l.538-.258c-.302-.652-.87-1.167-1.652-1.167-1.38 0-2.352 1.12-2.352 2.352 0 .74.361 1.38.927 1.83l-.39 1.558c.07.02.14.03.21.03h.003c1.402 0 2.703-1.193 2.703-2.653 0-1.458-1.164-2.653-2.653-2.653-.745 0-1.447.298-1.973.827l-.155-.116c.526-.474 1.164-.75 1.856-.75h.003c.238 0 .476.02.707.05l-.258.537c-.206-.03-.418-.05-.636-.05-.744 0-1.447.199-1.973.826z" />
    <path d="M3.813 20.688c-.744 0-1.447-.199-1.973-.826L1.6 19.612c.526-.527.826-1.229.826-1.973 0-1.458-1.193-2.703-2.703-2.703-1.458 0-2.703 1.193-2.703 2.703 0 1.37 1.04 2.653 2.546 2.803-.03.074-.05.15-.05.23 0 .148.12.283.268.348l1.558-.39c.224-.06.417-.06.636.05l.116.155z" />
  </svg>
);