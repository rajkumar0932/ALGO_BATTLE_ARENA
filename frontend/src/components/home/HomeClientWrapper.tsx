
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function HomeClientWrapper({ children }: { children: React.ReactNode }) {
  useScrollReveal();
  return <>{children}</>;
}
