import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  FileText,
  Clock,
  User,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Send,
  CheckCircle2,
  XCircle,
  Loader2,
  Tag,
  MessageSquare,
  StickyNote,
  GitBranch,
  Globe2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '../store';
import { Ticket, TicketStatus, Language } from '../types';
import { t } from '../services/multilingualService';
import { intentTypeLabels, priorityLabels } from '../services/ticketGenerator';
import EmotionBadge from './EmotionBadge';

const statusConfig: Record<TicketStatus, { color: string; bg: string; border: string; icon: React.ElementType }> = {
  open: { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertCircle },
  processing: { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: Loader2 },
  pending: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock },
  resolved: { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle2 },
  closed: { color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', icon: XCircle },
};

const priorityConfig: Record<string, { color: string; bg: string; border: string }> = {
  urgent: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
  high: { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
  medium: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  low: { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
};

function formatDateTime(ts: number, lang: Language): string {
  const d = new Date(ts);
  const opts: Intl.DateTimeFormatOptions = {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  };
  return d.toLocaleString(lang === 'zh' ? 'zh-CN' : lang === 'ja' ? 'ja-JP' : 'en-US', opts);
}

function timeAgo(ts: number, lang: Language): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return lang === 'zh' ? `${days}天前` : lang === 'ja' ? `${days}日前` : `${days}d ago`;
  if (hrs > 0) return lang === 'zh' ? `${hrs}小时前` : lang === 'ja' ? `${hrs}時間前` : `${hrs}h ago`;
  if (mins > 0) return lang === 'zh' ? `${mins}分钟前` : lang === 'ja' ? `${mins}分前` : `${mins}m ago`;
  return lang === 'zh' ? '刚刚' : lang === 'ja' ? 'たった今' : 'just now';
}

export default function TicketListPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const tickets = useAppStore((s) => s.tickets);
  const updateTicketStatus = useAppStore((s) => s.updateTicketStatus);
  const assignTicket = useAppStore((s) => s.assignTicket);
  const addTicketNote = useAppStore((s) => s.addTicketNote);
  const adminLanguage = useAppStore((s) => s.adminLanguage);
  const ui = t(adminLanguage);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [noteInput, setNoteInput] = useState('');
  const [assigneeInput, setAssigneeInput] = useState('');

  const selectedTicket = ticketId ? tickets.find((t) => t.id === ticketId) : null;

  const filteredTickets = useMemo(() => {
    let result = [...tickets];
    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          t.assignee?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [tickets, statusFilter, searchQuery]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: tickets.length };
    tickets.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return counts;
  }, [tickets]);

  if (selectedTicket) {
    return (
      <TicketDetail
        ticket={selectedTicket}
        lang={adminLanguage}
        ui={ui}
        onBack={() => navigate('/admin/tickets')}
        onUpdateStatus={updateTicketStatus}
        onAssign={assignTicket}
        onAddNote={(id, content, author) => {
          addTicketNote(id, content, author);
          setNoteInput('');
        }}
        noteInput={noteInput}
        setNoteInput={setNoteInput}
        assigneeInput={assigneeInput}
        setAssigneeInput={setAssigneeInput}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="flex-shrink-0 px-6 py-5 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-ai-500" />
              {ui.tickets}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {tickets.length} {adminLanguage === 'zh' ? '个工单' : adminLanguage === 'ja' ? '件' : 'tickets'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={ui.search}
                className="input-field !py-2.5 pl-9 pr-4 !text-sm w-64"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 flex-wrap">
          {(['all', 'open', 'processing', 'pending', 'resolved', 'closed'] as const).map((s) => {
            const count = statusCounts[s] || 0;
            const label = s === 'all' ? ui.all : ui[s as keyof typeof ui] as string;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  statusFilter === s
                    ? 'bg-gradient-to-r from-ai-500 to-primary-500 text-white shadow-md'
                    : 'bg-white/70 text-slate-600 border border-slate-200 hover:border-ai-200 hover:bg-ai-50/50'
                }`}
              >
                {label}
                <span className="ml-1.5 opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">{ui.noData}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredTickets.map((ticket, i) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  lang={adminLanguage}
                  ui={ui}
                  index={i}
                  onClick={() => navigate(`/admin/tickets/${ticket.id}`)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

function TicketCard({
  ticket,
  lang,
  ui,
  index,
  onClick,
}: {
  ticket: Ticket;
  lang: Language;
  ui: ReturnType<typeof t>;
  index: number;
  onClick: () => void;
}) {
  const sc = statusConfig[ticket.status];
  const pc = priorityConfig[ticket.priority];
  const StatusIcon = sc.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ y: -2, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
      onClick={onClick}
      className="ticket-card"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 text-sm truncate">{ticket.title}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{ticket.id}</p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${pc.bg} ${pc.color} ${pc.border} border`}>
          {ticket.priority === 'urgent' && '🔴'}
          {priorityLabels[lang][ticket.priority]}
        </div>
      </div>

      <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
        {ticket.summary}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${sc.bg} ${sc.color} ${sc.border} border`}>
            <StatusIcon className={`w-3 h-3 ${ticket.status === 'processing' ? 'animate-spin' : ''}`} />
            {ui[ticket.status as keyof typeof ui] as string}
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 text-[9px] font-bold text-slate-500 border border-slate-200">
            {intentTypeLabels[lang][ticket.type]}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          {ticket.assignee && (
            <span className="flex items-center gap-0.5">
              <User className="w-3 h-3" />
              {ticket.assignee}
            </span>
          )}
          <span>{timeAgo(ticket.updatedAt, lang)}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {ticket.emotionLevel > 40 && (
        <div className="mt-2 pt-2 border-t border-slate-100">
          <EmotionBadge
            emotion={ticket.emotionLevel >= 70 ? 'angry' : ticket.emotionLevel >= 40 ? 'concerned' : 'calm'}
            score={ticket.emotionLevel / 100}
            language={lang}
            size="sm"
          />
        </div>
      )}
    </motion.div>
  );
}

function TicketDetail({
  ticket,
  lang,
  ui,
  onBack,
  onUpdateStatus,
  onAssign,
  onAddNote,
  noteInput,
  setNoteInput,
  assigneeInput,
  setAssigneeInput,
}: {
  ticket: Ticket;
  lang: Language;
  ui: ReturnType<typeof t>;
  onBack: () => void;
  onUpdateStatus: (id: string, status: TicketStatus) => void;
  onAssign: (id: string, assignee: string) => void;
  onAddNote: (id: string, content: string, author: string) => void;
  noteInput: string;
  setNoteInput: (v: string) => void;
  assigneeInput: string;
  setAssigneeInput: (v: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<'info' | 'conversation' | 'notes'>('info');
  const sc = statusConfig[ticket.status];
  const pc = priorityConfig[ticket.priority];
  const StatusIcon = sc.icon;

  const nextStatuses: Record<TicketStatus, TicketStatus[]> = {
    open: ['processing', 'pending'],
    processing: ['pending', 'resolved'],
    pending: ['processing', 'resolved'],
    resolved: ['closed'],
    closed: [],
  };

  const tabs = [
    { key: 'info' as const, label: ui.summary, icon: FileText },
    { key: 'conversation' as const, label: ui.conversation, icon: MessageSquare },
    { key: 'notes' as const, label: ui.notes, icon: StickyNote },
  ];

  return (
    <div className="h-screen flex flex-col">
      <header className="flex-shrink-0 px-6 py-4 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="btn-secondary !px-3 !py-2 text-xs">
            <ArrowLeft className="w-4 h-4 mr-1" />
            {ui.backToList}
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-800 truncate">{ticket.title}</h2>
            <p className="text-xs text-slate-400 font-mono">{ticket.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${sc.bg} ${sc.color} ${sc.border} border`}>
              <StatusIcon className={`w-3.5 h-3.5 ${ticket.status === 'processing' ? 'animate-spin' : ''}`} />
              {ui[ticket.status as keyof typeof ui] as string}
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${pc.bg} ${pc.color} ${pc.border} border`}>
              {ticket.priority === 'urgent' && '🔴'}
              {priorityLabels[lang][ticket.priority]}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1 border-b border-slate-200/60 -mb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'border-ai-500 text-ai-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        {activeTab === 'info' && (
          <div className="space-y-6 max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-ai-500" />
                {ui.summary}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{ticket.summary}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-6">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4 text-ai-500" />
                {ui.priority}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400 text-xs">{ui.priority}</span>
                  <p className={`font-semibold ${pc.color}`}>{priorityLabels[lang][ticket.priority]}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">
                    {lang === 'zh' ? '类型' : lang === 'ja' ? '種類' : 'Type'}
                  </span>
                  <p className="font-semibold text-slate-700">{intentTypeLabels[lang][ticket.type]}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">{ui.createdAt}</span>
                  <p className="font-semibold text-slate-700">{formatDateTime(ticket.createdAt, lang)}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">{ui.updatedAt}</span>
                  <p className="font-semibold text-slate-700">{formatDateTime(ticket.updatedAt, lang)}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">{ui.assignedTo}</span>
                  <p className="font-semibold text-slate-700">{ticket.assignee || ui.unassigned}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-xs flex items-center gap-1">
                    <Globe2 className="w-3 h-3" />
                    {ui.language}
                  </span>
                  <p className="font-semibold text-slate-700">{ticket.language.toUpperCase()}</p>
                </div>
              </div>

              {ticket.emotionLevel > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <EmotionBadge
                    emotion={ticket.emotionLevel >= 70 ? 'angry' : ticket.emotionLevel >= 40 ? 'concerned' : 'calm'}
                    score={ticket.emotionLevel / 100}
                    language={lang}
                    size="md"
                    showScore
                  />
                </div>
              )}

              {ticket.keyEntities && (ticket.keyEntities.orderId || ticket.keyEntities.productName || ticket.keyEntities.amount) && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wider">
                    {lang === 'zh' ? '关键实体' : lang === 'ja' ? 'キーエンティティ' : 'Key Entities'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ticket.keyEntities.orderId && (
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                        #{ticket.keyEntities.orderId}
                      </span>
                    )}
                    {ticket.keyEntities.productName && (
                      <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200">
                        {ticket.keyEntities.productName}
                      </span>
                    )}
                    {ticket.keyEntities.amount && (
                      <span className="px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-semibold border border-green-200">
                        ¥{ticket.keyEntities.amount}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-ai-500" />
                {ui.changeStatus}
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {nextStatuses[ticket.status].map((s) => {
                  const ns = statusConfig[s];
                  return (
                    <button
                      key={s}
                      onClick={() => onUpdateStatus(ticket.id, s)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 ${ns.bg} ${ns.color} border ${ns.border} hover:shadow-md`}
                    >
                      <ns.icon className={`w-3.5 h-3.5 ${s === 'processing' ? 'animate-spin' : ''}`} />
                      {ui[s as keyof typeof ui] as string}
                    </button>
                  );
                })}
                {nextStatuses[ticket.status].length === 0 && (
                  <p className="text-xs text-slate-400">
                    {lang === 'zh' ? '当前状态无法变更' : lang === 'ja' ? '現在のステータスは変更できません' : 'No status changes available'}
                  </p>
                )}
              </div>

              <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-ai-500" />
                {ui.assignAgent}
              </h3>
              <div className="flex gap-2">
                <input
                  value={assigneeInput}
                  onChange={(e) => setAssigneeInput(e.target.value)}
                  placeholder={lang === 'zh' ? '输入处理人姓名' : lang === 'ja' ? '担当者名を入力' : 'Enter agent name'}
                  className="input-field !py-2.5 !text-sm flex-1"
                />
                <button
                  onClick={() => {
                    if (assigneeInput.trim()) {
                      onAssign(ticket.id, assigneeInput.trim());
                      setAssigneeInput('');
                    }
                  }}
                  disabled={!assigneeInput.trim()}
                  className="btn-primary !px-4 !py-2.5 text-sm"
                >
                  {ui.submit}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'conversation' && (
          <div className="max-w-3xl space-y-4">
            {ticket.messages.length === 0 ? (
              <div className="text-center py-16">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">{ui.noData}</p>
              </div>
            ) : (
              ticket.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : msg.role === 'system' ? 'justify-center' : 'justify-start'}`}
                >
                  {msg.role === 'system' ? (
                    <div className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium max-w-md text-center">
                      {msg.content}
                    </div>
                  ) : (
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-br-md'
                          : 'bg-white/90 border border-slate-200 text-slate-700 rounded-bl-md shadow-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-white/60' : 'text-slate-400'}`}>
                        {formatDateTime(msg.timestamp, lang)}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="max-w-3xl space-y-4">
            <div className="glass-card p-4">
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder={ui.addNotePlaceholder}
                rows={3}
                className="input-field !text-sm resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => {
                    if (noteInput.trim()) {
                      onAddNote(ticket.id, noteInput.trim(), ticket.assignee || 'Admin');
                    }
                  }}
                  disabled={!noteInput.trim()}
                  className="btn-ai !px-4 !py-2 text-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {ui.addNote}
                </button>
              </div>
            </div>

            {ticket.notes && ticket.notes.length > 0 ? (
              [...ticket.notes].reverse().map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-ai-600 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {note.author}
                    </span>
                    <span className="text-[10px] text-slate-400">{formatDateTime(note.timestamp, lang)}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{note.content}</p>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <StickyNote className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">{ui.noData}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
