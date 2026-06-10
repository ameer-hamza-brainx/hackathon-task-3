import type { CompletedSession } from '../../shared/types';
import { getHeroLine } from '../utils/hero-lines';

type Props = {
  session: CompletedSession;
};

export function HeroSummary({ session }: Props) {
  const notificationCount = session.stats.notifications;

  return (
    <p className="text-base font-medium text-slate-800 leading-snug">
      {getHeroLine(notificationCount, session.durationMs)}
    </p>
  );
}
