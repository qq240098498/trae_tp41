import React from 'react';
import { Smile, Meh, Frown, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { EmotionState, Language } from '../types';
import { getEmotionColor, getEmotionLabel } from '../services/emotionAnalyzer';

interface EmotionBadgeProps {
  emotion: EmotionState;
  score?: number;
  language: Language;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
  pulse?: boolean;
}

export default function EmotionBadge({
  emotion,
  score,
  language,
  size = 'md',
  showScore = false,
  pulse = false,
}: EmotionBadgeProps) {
  const Icon =
    emotion === 'calm' ? Smile : emotion === 'concerned' ? Meh : Frown;
  const label = getEmotionLabel(emotion, language);
  const colorClass = getEmotionColor(emotion);
  const dotColor =
    emotion === 'calm'
      ? 'bg-emerald-500'
      : emotion === 'concerned'
      ? 'bg-amber-500'
      : 'bg-red-500';

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-3 py-1 text-xs gap-1.5',
    lg: 'px-4 py-1.5 text-sm gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`status-badge ${sizeClasses[size]} ${colorClass} border-current/10`}
    >
      <div className="relative">
        {pulse ? (
          <>
            <span
              className={`absolute inset-0 rounded-full ${dotColor} animate-pulse-ring`}
            />
            <span className={`relative block w-2 h-2 rounded-full ${dotColor}`} />
          </>
        ) : (
          <span className={`block w-2 h-2 rounded-full ${dotColor}`} />
        )}
      </div>
      <Icon className={iconSizes[size]} />
      <span className="font-semibold">{label}</span>
      {showScore && score !== undefined && (
        <span className="opacity-70 tabular-nums">
          {Math.round(score * 100)}%
        </span>
      )}
      {emotion === 'angry' && (
        <AlertTriangle className={`${iconSizes[size]} animate-pulse`} />
      )}
    </motion.div>
  );
}
