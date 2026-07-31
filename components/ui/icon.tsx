import {
  ShieldCheck, CalendarClock, Layers, Wrench, CircuitBoard, Factory, Lamp,
  Zap, Phone, CheckCircle2, Users, Award, ArrowRight, FileText, MessageSquare,
  type LucideIcon,
} from 'lucide-react';

/**
 * 어드민에서 고를 수 있는 아이콘 목록.
 *
 * lucide 전체를 열어두면 번들이 커지고, 사장님이 존재하지 않는 이름을 넣으면
 * 화면이 빈칸이 된다. 여기 등록된 것만 쓰고, 모르는 이름은 조용히 기본값으로 떨어진다.
 */
const ICONS: Record<string, LucideIcon> = {
  ShieldCheck, CalendarClock, Layers, Wrench, CircuitBoard, Factory, Lamp,
  Zap, Phone, CheckCircle2, Users, Award, ArrowRight, FileText, MessageSquare,
};

export function resolveIcon(name: string | null | undefined, fallback: LucideIcon = CheckCircle2): LucideIcon {
  if (!name) return fallback;
  return ICONS[name] ?? fallback;
}

export function Icon({
  name,
  className,
  fallback,
}: {
  name: string | null | undefined;
  className?: string;
  fallback?: LucideIcon;
}) {
  const Cmp = resolveIcon(name, fallback);
  return <Cmp className={className} />;
}
