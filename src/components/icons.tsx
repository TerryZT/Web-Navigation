
"use client";
import type { LucideProps } from 'lucide-react';
import {
  Home, Briefcase, BookOpen, Code, Settings, Link as LinkIconLucide, Folder, FileText,
  Zap, Palette, Github, AlertTriangle, CheckCircle, Info, XCircle, Trash2, Edit3, PlusCircle,
  Search, Users, ShoppingCart, Film, Globe, ExternalLink, ChevronDown, ChevronRight, Menu, LogOut, Eye, EyeOff,
  Moon, Sun, KeyRound // Added KeyRound
} from 'lucide-react';

// Add any new icons here
export const iconMap: Record<string, React.ElementType<LucideProps>> = {
  Home,
  Briefcase,
  BookOpen,
  Code,
  Settings,
  Link: LinkIconLucide,
  Folder,
  FileText,
  Zap,
  Palette,
  Github,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  Trash2,
  Edit3,
  PlusCircle,
  Search,
  Users,
  ShoppingCart,
  Film,
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Menu,
  LogOut,
  Eye,
  EyeOff,
  Moon,
  Sun,
  KeyRound, // Added KeyRound
  Default: LinkIconLucide, // Fallback icon
};

interface IconProps extends LucideProps {
  name?: string;
}

const IconComponent: React.FC<IconProps> = ({ name, ...props }) => {
  const Icon = name && name in iconMap ? iconMap[name] : iconMap.Default;
  return <Icon {...props} />;
};

export default IconComponent;
