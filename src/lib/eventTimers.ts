import { EVENT_SCHEDULES, type EventScheduleSpec } from '../shared/muData';

export interface ComputedEventState {
  event: EventScheduleSpec;
  status: 'active' | 'warning' | 'upcoming';
  nextTimeLabel: string;
  secondsUntil: number;
  formattedCountdown: string;
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function computeEventCountdowns(now: Date): ComputedEventState[] {
  const nowSecOfDay = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const daySeconds = 24 * 3600;

  return EVENT_SCHEDULES.map((event) => {
    const startTimes = event.scheduleTimes.map((t) => {
      const [h, m] = t.split(':').map((v) => Number.parseInt(v, 10));
      return { label: t, sec: h * 3600 + m * 60 };
    });

    const durationSec = event.durationMinutes * 60;
    const warningSec = event.warningMinutes * 60;

    // Check if currently active
    for (const slot of startTimes) {
      const elapsed = (nowSecOfDay - slot.sec + daySeconds) % daySeconds;
      if (elapsed >= 0 && elapsed < durationSec) {
        const remaining = durationSec - elapsed;
        return {
          event,
          status: 'active' as const,
          nextTimeLabel: slot.label,
          secondsUntil: remaining,
          formattedCountdown: formatDuration(remaining),
        };
      }
    }

    // Otherwise find closest upcoming slot
    let bestDiff = Number.POSITIVE_INFINITY;
    let bestLabel = startTimes[0]?.label || '00:00';
    for (const slot of startTimes) {
      let diff = slot.sec - nowSecOfDay;
      if (diff <= 0) diff += daySeconds;
      if (diff < bestDiff) {
        bestDiff = diff;
        bestLabel = slot.label;
      }
    }

    const isWarning = warningSec > 0 && bestDiff <= warningSec;
    return {
      event,
      status: isWarning ? ('warning' as const) : ('upcoming' as const),
      nextTimeLabel: bestLabel,
      secondsUntil: bestDiff,
      formattedCountdown: formatDuration(bestDiff),
    };
  }).sort((a, b) => {
    const rank = (s: ComputedEventState['status']) => (s === 'active' ? 0 : s === 'warning' ? 1 : 2);
    return rank(a.status) - rank(b.status) || a.secondsUntil - b.secondsUntil;
  });
}
