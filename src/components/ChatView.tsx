import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  PlusCircle,
  Bot,
  User,
  Globe2,
  Sparkles,
  Loader2,
  Star,
  FileText,
  Languages,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '../store';
import { Language, Message, IntentType } from '../types';
import { langLabels, t } from '../services/multilingualService';
import { getQuickQuestions } from '../services/responseGenerator';
import EmotionBadge from './EmotionBadge';

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function getIntentLabel(intent?: IntentType, lang?: Language): string {
  if (!intent || !lang) return '';
  const labels: Record<Language, Record<IntentType, string>> = {
    zh: {
      consultation: '咨询', complaint: '投诉', after_sales: '售后', refund: '退款',
      shipping: '物流', product_info: '产品', account: '账户', greeting: '问候',
      thanks: '感谢', farewell: '道别', human_request: '转人工', unknown: '未知',
    },
    en: {
      consultation: 'Consult', complaint: 'Complaint', after_sales: 'Support', refund: 'Refund',
      shipping: 'Shipping', product_info: 'Product', account: 'Account', greeting: 'Greeting',
      thanks: 'Thanks', farewell: 'Bye', human_request: 'Human', unknown: 'Unknown',
    },
    ja: {
      consultation: '問合', complaint: 'クレ', after_sales: 'ｱﾌﾀｰ', refund: '返金',
      shipping: '配送', product_info: '製品', account: 'ｱｶｳﾝﾄ', greeting: '挨拶',
      thanks: '感謝', farewell: '別れ', human_request: '人間', unknown: '不明',
    },
  };
  return labels[lang]?.[intent] || intent;
}

export default function ChatView() {
  const conv = useAppStore((s) => s.getActiveConversation());
  const ensureConversation = useAppStore((s) => s.ensureConversation);
  const sendUserMessage = useAppStore((s) => s.sendUserMessage);
  const newConversation = useAppStore((s) => s.newConversation);
  const updateConversationLanguage = useAppStore((s) => s.updateConversationLanguage);
  const markConversationResolved = useAppStore((s) => s.markConversationResolved);
  const isTyping = useAppStore((s) => s.isTyping);
  const adminLanguage = useAppStore((s) => s.adminLanguage);
  const ui = t(adminLanguage);

  const [input, setInput] = useState('');
  const [showSatisfaction, setShowSatisfaction] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!conv) ensureConversation();
  }, [conv, ensureConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conv?.messages.length, isTyping]);

  if (!conv) return null;

  const messages = conv.messages;
  const currentLang = conv.currentLanguage;
  const uiConv = t(currentLang);

  const handleSend = async (textOverride?: string) => {
    const text = textOverride ?? input;
    if (!text.trim() || isTyping) return;
    setInput('');
    await sendUserMessage(text);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickQuestion = async (label: string, _intent: IntentType) => {
    if (isTyping) return;
    const cleaned = label.replace(/^[\p{Emoji_Presentation}\s]+/u, '').trim();
    await sendUserMessage(cleaned);
  };

  const handleRating = async (rating: number) => {
    setSelectedRating(rating);
    if (conv) {
      markConversationResolved(conv.id, rating);
    }
    setTimeout(() => {
      setShowSatisfaction(false);
      setSelectedRating(0);
      newConversation(currentLang);
    }, 1200);
  };

  const quickQuestions = getQuickQuestions(currentLang);

  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
  const avgEmotion =
    conv.emotionTrend.length > 0
      ? conv.emotionTrend.reduce((a, b) => a + b, 0) / conv.emotionTrend.length
      : 0;
  const displayEmotion =
    lastUserMessage?.emotion ??
    (avgEmotion >= 0.7 ? 'angry' : avgEmotion >= 0.35 ? 'concerned' : 'calm');

  return (
    <div className="h-screen flex flex-col lg:flex-row">
      <section className="flex-1 flex flex-col min-w-0">
        <header className="flex-shrink-0 px-6 py-4 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="relative"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-ai-500 to-primary-500 flex items-center justify-center shadow-lg shadow-ai-500/30">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
              </motion.div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  {uiConv.chatTitle}
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </h2>
                <p className="text-xs text-slate-500">{uiConv.chatSubtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {lastUserMessage?.emotion && (
                <EmotionBadge
                  emotion={displayEmotion}
                  score={lastUserMessage.emotionScore}
                  language={currentLang}
                  showScore
                  pulse={displayEmotion === 'angry'}
                />
              )}

              <div className="flex items-center rounded-xl bg-white/80 border border-slate-200 overflow-hidden">
                {(['zh', 'en', 'ja'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => updateConversationLanguage(conv.id, lang)}
                    className={`flex items-center gap-1 px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                      currentLang === lang
                        ? 'bg-gradient-to-r from-ai-500 to-primary-500 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{langLabels[lang].flag}</span>
                    <Languages className="w-3 h-3" />
                  </button>
                ))}
              </div>

              <button
                onClick={() => newConversation(currentLang)}
                className="btn-secondary !px-3 !py-2 flex items-center gap-1.5 text-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">{uiConv.newConversation}</span>
              </button>

              {messages.length >= 3 && conv.status !== 'resolved' && (
                <button
                  onClick={() => setShowSatisfaction(true)}
                  className="btn-ai !px-3 !py-2 flex items-center gap-1.5 text-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="hidden sm:inline">解决</span>
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
            <Clock className="w-3 h-3" />
            <span>
              {new Date(conv.createdAt).toLocaleDateString()} · {messages.length}{' '}
              {currentLang === 'zh' ? '条消息' : currentLang === 'ja' ? 'メッセージ' : 'messages'}
            </span>
            {conv.status === 'ticket_created' && conv.ticketId && (
              <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                <FileText className="w-3 h-3" />
                工单 {conv.ticketId}
              </span>
            )}
            {conv.status === 'resolved' && (
              <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                {currentLang === 'zh' ? '已解决' : 'Resolved'}
                {conv.satisfaction && ` · ${'⭐'.repeat(conv.satisfaction)}`}
              </span>
            )}
          </div>
        </header>

        {conv.status === 'ticket_created' && conv.ticketId && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 md:mx-8 mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-ai-50 via-primary-50 to-amber-50 border border-ai-200/60 flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ai-500 to-primary-500 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-700">
                {currentLang === 'zh'
                  ? `工单已创建（${conv.ticketId}），您仍可继续对话补充信息`
                  : currentLang === 'ja'
                  ? `チケット作成済み（${conv.ticketId}）、引き続きチャット可能です`
                  : `Ticket created (${conv.ticketId}), you can still continue chatting`}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentLang === 'zh'
                  ? '人工客服将在30分钟内开始处理，您可以继续提问或稍后查看工单进度'
                  : currentLang === 'ja'
                  ? '担当者が30分以内に対応を開始します。追加のご質問があればどうぞ'
                  : 'An agent will start within 30 mins. Feel free to ask more questions'}
              </p>
            </div>
          </motion.div>
        )}

        <div className="flex-1 overflow-y-auto scrollbar-thin px-4 md:px-8 py-6 space-y-5 bg-gradient-to-b from-slate-50/50 via-white/0 to-transparent">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto text-center py-12"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-ai-100 via-primary-100 to-amber-100 flex items-center justify-center shadow-inner">
                <Sparkles className="w-10 h-10 text-primary-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {uiConv.chatTitle}
              </h3>
              <p className="text-sm text-slate-500 mb-6">{uiConv.chatSubtitle}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                {quickQuestions.slice(0, 4).map((qq, i) => (
                  <motion.button
                    key={qq.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuickQuestion(qq.label, qq.intent)}
                    disabled={conv.status === 'resolved'}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-700 hover:border-ai-300 hover:bg-ai-50/50 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
                  >
                    {qq.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                index={idx}
                lang={currentLang}
                prevMsg={messages[idx - 1]}
              />
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
            >
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-ai-500 to-primary-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-ai-500/20">
                <Bot className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="message-bubble-ai">
                <div className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 text-ai-500 animate-spin" />
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-ai-500 animate-typing-dot"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {conv.status !== 'resolved' && messages.length > 3 && messages.length % 4 === 0 && (
          <div className="px-4 md:px-8 pb-2 -mt-3">
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2">
              💡 {uiConv.quickQuestions}
            </p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((qq) => (
                <button
                  key={qq.label}
                  onClick={() => handleQuickQuestion(qq.label, qq.intent)}
                  disabled={isTyping || conv.status === 'resolved'}
                  className="px-3 py-1.5 text-xs rounded-full bg-white/70 border border-slate-200 text-slate-600 hover:bg-ai-50 hover:border-ai-200 hover:text-ai-700 transition-all duration-200 disabled:opacity-50"
                >
                  {qq.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-shrink-0 px-4 md:px-8 py-4 border-t border-slate-200/60 bg-gradient-to-t from-white via-white/90 to-transparent">
          <div className="max-w-4xl mx-auto flex items-end gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={uiConv.inputPlaceholder}
                disabled={isTyping || conv.status === 'resolved'}
                className="input-field !py-4 pl-5 pr-14 rounded-2xl !text-base shadow-lg shadow-slate-200/50"
              />
              <div className="absolute right-3 bottom-1/2 translate-y-1/2 flex items-center gap-1 text-[10px] text-slate-400">
                <Globe2 className="w-3.5 h-3.5" />
                <span className="font-semibold">{langLabels[currentLang].code}</span>
              </div>
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping || conv.status === 'resolved'}
              className="btn-primary !px-5 !py-4 rounded-2xl flex items-center gap-2 shadow-xl shadow-primary-500/30"
            >
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-semibold">{uiConv.send}</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-2">
            {currentLang === 'zh'
              ? '💡 系统将自动识别语言并进行情绪分析 · Enter 发送'
              : currentLang === 'ja'
              ? '💡 自動言語検出と感情分析 · Enter で送信'
              : '💡 Auto language detection & emotion analysis · Press Enter to send'}
          </p>
        </div>
      </section>

      <AnimatePresence>
        {showSatisfaction && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSatisfaction(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto z-50"
            >
              <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
                {selectedRating > 0 ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                    className="space-y-4"
                  >
                    <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <p className="text-xl font-bold text-slate-800">
                      {currentLang === 'zh' ? '感谢您的评价！' : 'Thank you!'}
                    </p>
                    <p className="text-slate-500">
                      {'⭐'.repeat(selectedRating)}
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-100 to-ai-100 flex items-center justify-center">
                      <Star className="w-8 h-8 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">
                      {uiConv.satisfactionTitle}
                    </h3>
                    <p className="text-sm text-slate-500 mb-6">
                      {uiConv.satisfactionDesc}
                    </p>
                    <div className="flex justify-center gap-2 mb-6">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <motion.button
                          key={r}
                          whileHover={{ scale: 1.15, y: -4 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRating(r)}
                          className="p-2 transition-colors"
                        >
                          <Star
                            className={`w-10 h-10 ${
                              r <= selectedRating
                                ? 'fill-amber-400 stroke-amber-500 drop-shadow-md'
                                : 'stroke-slate-300 hover:stroke-amber-400'
                            }`}
                          />
                        </motion.button>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowSatisfaction(false)}
                      className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {uiConv.cancel}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function MessageBubble({
  message,
  index,
  lang,
  prevMsg,
}: {
  message: Message;
  index: number;
  lang: Language;
  prevMsg?: Message;
}) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const timeGap =
    prevMsg && message.timestamp - prevMsg.timestamp > 5 * 60 * 1000;

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="max-w-lg mx-auto my-6"
      >
        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 border-2 border-amber-200/70 shadow-lg shadow-amber-200/40">
          <div className="absolute -top-3 left-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-md">
            <AlertCircle className="w-3.5 h-3.5" />
            系统通知
          </div>
          <div className="pt-2 whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-medium">
            {message.content}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      {timeGap && (
        <div className="flex justify-center py-1">
          <span className="text-[10px] text-slate-400 bg-white/70 px-3 py-1 rounded-full border border-slate-200/60">
            {formatTime(message.timestamp)}
          </span>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index % 2 === 0 ? 0 : 0.05 }}
        className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
      >
        <div
          className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${
            isUser
              ? 'bg-gradient-to-br from-primary-500 to-primary-700 shadow-primary-500/20'
              : 'bg-gradient-to-br from-ai-500 to-primary-500 shadow-ai-500/20'
          }`}
        >
          {isUser ? (
            <User className="w-4.5 h-4.5 text-white" />
          ) : (
            <Bot className="w-4.5 h-4.5 text-white" />
          )}
        </div>

        <div className={`max-w-[72%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
          <div
            className={`px-5 py-3.5 rounded-2xl shadow-lg whitespace-pre-wrap leading-relaxed ${
              isUser
                ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-br-md shadow-primary-500/20'
                : 'bg-white/95 backdrop-blur border border-slate-200 text-slate-800 rounded-bl-md shadow-slate-200/60'
            }`}
          >
            <p className="text-[14.5px]">{message.content}</p>
          </div>

          <div
            className={`flex items-center gap-2 mt-1.5 ${
              isUser ? 'flex-row-reverse' : ''
            }`}
          >
            <span className="text-[10px] text-slate-400 tabular-nums">
              {formatTime(message.timestamp)}
            </span>
            {!isUser && message.intent && message.intent !== 'greeting' && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-100 text-[9px] font-bold text-slate-500 border border-slate-200">
                {getIntentLabel(message.intent, lang)}
              </span>
            )}
            {isUser && message.emotion && (
              <span
                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold border ${
                  message.emotion === 'calm'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : message.emotion === 'concerned'
                    ? 'bg-amber-50 text-amber-600 border-amber-200'
                    : 'bg-red-50 text-red-600 border-red-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    message.emotion === 'calm'
                      ? 'bg-emerald-500'
                      : message.emotion === 'concerned'
                      ? 'bg-amber-500'
                      : 'bg-red-500 animate-pulse'
                  }`}
                />
                {Math.round((message.emotionScore || 0) * 100)}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
