import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bot,
  MessageSquare,
  ClipboardList,
  BarChart3,
  Sparkles,
  Globe,
} from 'lucide-react';
import { motion } from 'framer-motion';
import useAppStore from '../store';
import { Language } from '../types';
import { langLabels, t } from '../services/multilingualService';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const adminLanguage = useAppStore((s) => s.adminLanguage);
  const setAdminLanguage = useAppStore((s) => s.setAdminLanguage);
  const ui = t(adminLanguage);

  const navItems = [
    { path: '/', label: ui.chatView, icon: MessageSquare },
    { path: '/admin/tickets', label: ui.tickets, icon: ClipboardList },
    { path: '/admin/dashboard', label: ui.dashboard, icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 flex-shrink-0 border-r border-slate-200/60 bg-gradient-to-b from-white/90 via-blue-50/40 to-teal-50/40 backdrop-blur-xl">
        <div className="p-5 border-b border-slate-200/50">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: [0, -8, 8, 0], scale: 1.05 }}
              transition={{ duration: 0.5 }}
              className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-ai-500 flex items-center justify-center shadow-lg shadow-primary-500/30"
            >
              <Bot className="w-6 h-6 text-white" />
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-400" />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-ai-600 bg-clip-text text-transparent">
                SmartCS
              </h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide">
                {ui.appTitle}
              </p>
            </div>
          </Link>
        </div>

        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-ai-600' : ''}`} />
                <span className="text-sm">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary-500 to-ai-500"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3 border-t border-slate-200/50 bg-gradient-to-t from-white/80 to-transparent">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider px-4 mb-2">
            <Globe className="inline w-3 h-3 mr-1.5 align-middle" />
            {ui.language}
          </div>
          <div className="flex gap-1.5 px-2">
            {(['zh', 'en', 'ja'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setAdminLanguage(lang)}
                className={`flex-1 px-2 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  adminLanguage === lang
                    ? 'bg-gradient-to-r from-primary-500 to-ai-500 text-white shadow-md shadow-primary-500/20'
                    : 'bg-white/60 text-slate-600 hover:bg-white border border-slate-200/60'
                }`}
              >
                <span className="mr-1">{langLabels[lang].flag}</span>
                {langLabels[lang].code}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 text-center pt-1">
            © 2026 SmartCS · Powered by AI
          </p>
        </div>
      </aside>

      <main className="flex-1 min-h-screen overflow-x-hidden">
        <div className="h-full">{children}</div>
      </main>
    </div>
  );
}
