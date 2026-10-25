import React from 'react';
import {
  ShieldCheck,
  Sun,
  Moon,
  Sparkles,
  LayoutDashboard,
  FileCheck2,
  BookOpen,
  UserCheck,
  History,
  BarChart3,
  Home,
  PlusCircle,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  openCopilot: () => void;
  pendingApprovalsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  setCurrentRole,
  theme,
  toggleTheme,
  openCopilot,
  pendingApprovalsCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = React.useState(false);

  const roleLabels: Record<UserRole, { title: string; color: string; desc: string }> = {
    admin: {
      title: 'Administrator',
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      desc: 'Full governance, brand rules & system control',
    },
    creator: {
      title: 'Creator',
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      desc: 'Drafts, submits & revises marketing content',
    },
    reviewer: {
      title: 'Reviewer',
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      desc: 'Inspects findings, comments & requests revisions',
    },
    approver: {
      title: 'Approver',
      color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      desc: 'Authorized to grant or reject final publication',
    },
  };

  const navLinks = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'review', label: 'Content Review', icon: FileCheck2 },
    { id: 'brands', label: 'Brand Library', icon: BookOpen },
    {
      id: 'approvals',
      label: 'Approval Center',
      icon: UserCheck,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
    },
    { id: 'audit', label: 'Audit Trail', icon: History },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors duration-200 bg-slate-950/80 border-slate-800 text-slate-100 dark:bg-slate-950/80 dark:border-slate-800 light:bg-white/90 light:border-slate-200 light:text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-400 p-[1.5px] shadow-lg shadow-sky-500/20 group-hover:shadow-sky-500/40 transition-all duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                  INKLOOM
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                Brand Governance
              </p>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{link.label}</span>
                {link.badge !== undefined && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Role Switcher, Copilot Button, Theme Toggle, Mobile Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* INKLOOM Copilot Trigger */}
          <button
            onClick={openCopilot}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-600 text-white shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border border-indigo-400/30 shrink-0"
            aria-label="Open INKLOOM AI Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin-slow shrink-0" />
            <span className="text-xs">Copilot</span>
          </button>

          {/* Role Switcher - compact on mobile */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors ${roleLabels[currentRole].color}`}
              title="Switch user perspective"
            >
              <span className="hidden sm:inline text-slate-400 font-normal">Role:</span>
              <span className="font-semibold text-[11px] sm:text-xs">{roleLabels[currentRole].title}</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {roleMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-2 z-50 text-slate-200"
                onClick={() => setRoleMenuOpen(false)}
              >
                <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select User Role
                </div>
                {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => setCurrentRole(role)}
                    className={`w-full text-left px-3 py-2 flex flex-col gap-0.5 hover:bg-slate-800/80 transition-colors ${
                      currentRole === role ? 'bg-slate-800/90 text-sky-300' : 'text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs">{roleLabels[role].title}</span>
                      {currentRole === role && (
                        <span className="text-[10px] text-sky-400 font-bold">Active</span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">{roleLabels[role].desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-slate-800 transition-colors shrink-0"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />}
          </button>

          {/* New Review Quick Action (hidden on small mobile to prevent overflow, available in drawer) */}
          <button
            onClick={() => setActiveTab('review')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Review</span>
          </button>

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none shrink-0"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/95 px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  setActiveTab(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-sky-400" />
                  <span>{link.label}</span>
                </div>
                {link.badge !== undefined && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
