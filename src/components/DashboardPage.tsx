import React from 'react';
import {
  BarChart3,
  MessageSquare,
  FileText,
  Clock,
  Star,
  Zap,
  Users,
  TrendingUp,
  Smile,
  Meh,
  Frown,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import useAppStore from '../store';
import { Language, IntentType, EmotionState } from '../types';
import { t } from '../services/multilingualService';

const EMOTION_COLORS: Record<EmotionState, string> = {
  calm: '#10b981',
  concerned: '#f59e0b',
  angry: '#ef4444',
};

const INTENT_COLORS = [
  '#1e3a5f', '#0d9488', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
  '#14b8a6', '#a855f7',
];

const RADIAN = Math.PI / 180;

function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function DashboardPage() {
  const stats = useAppStore((s) => s.stats);
  const adminLanguage = useAppStore((s) => s.adminLanguage);
  const ui = t(adminLanguage);

  const emotionData = [
    { name: ui.calm, value: stats.emotions.calm, fill: EMOTION_COLORS.calm },
    { name: ui.concerned, value: stats.emotions.concerned, fill: EMOTION_COLORS.concerned },
    { name: ui.angry, value: stats.emotions.angry, fill: EMOTION_COLORS.angry },
  ];

  const intentData = (Object.keys(stats.intentDistribution) as IntentType[])
    .filter((k) => k !== 'greeting' && k !== 'thanks' && k !== 'farewell')
    .map((k, i) => ({
      name: ui[k as keyof typeof ui] as string || k,
      value: stats.intentDistribution[k],
      fill: INTENT_COLORS[i % INTENT_COLORS.length],
    }));

  const dailyData = stats.dailyTrend.map((d) => ({
    name: d.date,
    [ui.conversations]: d.conversations,
    [ui.ticketsLabel]: d.tickets,
  }));

  const statCards = [
    {
      label: ui.totalConversations,
      value: stats.totalConversations,
      icon: MessageSquare,
      color: 'from-primary-500 to-primary-600',
      shadow: 'shadow-primary-500/25',
    },
    {
      label: ui.autoResolutionRate,
      value: `${stats.autoResolutionRate}%`,
      icon: Zap,
      color: 'from-emerald-500 to-emerald-600',
      shadow: 'shadow-emerald-500/25',
    },
    {
      label: ui.avgResponseTime,
      value: `${stats.avgResponseTime}${ui.seconds}`,
      icon: Clock,
      color: 'from-ai-500 to-ai-600',
      shadow: 'shadow-ai-500/25',
    },
    {
      label: ui.avgSatisfaction,
      value: `${stats.avgSatisfaction} / 5`,
      icon: Star,
      color: 'from-amber-500 to-amber-600',
      shadow: 'shadow-amber-500/25',
    },
    {
      label: ui.ticketsCreated,
      value: stats.ticketsCreated,
      icon: FileText,
      color: 'from-orange-500 to-orange-600',
      shadow: 'shadow-orange-500/25',
    },
    {
      label: ui.ticketsResolved,
      value: stats.ticketsResolved,
      icon: TrendingUp,
      color: 'from-teal-500 to-teal-600',
      shadow: 'shadow-teal-500/25',
    },
  ];

  return (
    <div className="h-screen flex flex-col">
      <header className="flex-shrink-0 px-6 py-5 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-ai-500" />
          {ui.dashboard}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {adminLanguage === 'zh' ? '实时数据概览与趋势分析' : adminLanguage === 'ja' ? 'リアルタイムデータ概要とトレンド分析' : 'Real-time data overview & trend analysis'}
        </p>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="stat-card"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg ${card.shadow} mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-slate-800 tabular-nums">{card.value}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{card.label}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-ai-500" />
              {ui.dailyTrend}
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ticketGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area
                    type="monotone"
                    dataKey={ui.conversations}
                    stroke="#1e3a5f"
                    fill="url(#convGrad)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey={ui.ticketsLabel}
                    stroke="#0d9488"
                    fill="url(#ticketGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-card p-6"
          >
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-ai-500" />
              {ui.emotionDistribution}
            </h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={emotionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={90}
                    dataKey="value"
                    stroke="none"
                  >
                    {emotionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    formatter={(value: string) => <span style={{ fontSize: '12px', color: '#475569' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-2">
              {emotionData.map((e) => (
                <div key={e.name} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: e.fill }} />
                  <span className="text-xs text-slate-600 font-medium">{e.name}</span>
                  <span className="text-xs text-slate-400 tabular-nums">({e.value})</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-ai-500" />
            {ui.intentDistribution}
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={intentData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  angle={-20}
                  textAnchor="end"
                  height={50}
                />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {intentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass-card p-6"
        >
          <h3 className="text-sm font-bold text-slate-700 mb-4">
            {adminLanguage === 'zh' ? '情绪与满意度趋势' : adminLanguage === 'ja' ? '感情・満足度トレンド' : 'Emotion & Satisfaction Trend'}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyTrend.map((d) => ({
                name: d.date,
                [adminLanguage === 'zh' ? '满意度' : adminLanguage === 'ja' ? '満足度' : 'Satisfaction']: d.avgSatisfaction,
              }))}>
                <defs>
                  <linearGradient id="satGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={adminLanguage === 'zh' ? '满意度' : adminLanguage === 'ja' ? '満足度' : 'Satisfaction'}
                  stroke="#f59e0b"
                  fill="url(#satGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
