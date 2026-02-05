import { ShieldCheck } from 'lucide-react';
import { useAppStore } from '@/store/appStore';

export function PrivacyNotice() {
  const privacyNotice = useAppStore((s) => s.config.privacyNotice);

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-lg text-sm">
      <ShieldCheck className="w-4 h-4 flex-shrink-0" />
      <span>{privacyNotice}</span>
    </div>
  );
}
