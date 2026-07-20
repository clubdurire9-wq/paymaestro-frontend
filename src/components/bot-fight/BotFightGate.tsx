'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Loader2 } from 'lucide-react';

const BOT_PASS_KEY = 'paymaestro_bot_pass';
const BOT_FIGHT_ROUTE_REGEX = /^\/[a-z]{2}\/bot-fight$/;

export default function BotFightGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const isBotFightPage = BOT_FIGHT_ROUTE_REGEX.test(pathname || '');
    if (isBotFightPage) {
      setAllowed(true);
      setChecking(false);
      return;
    }

    const botPass = sessionStorage.getItem(BOT_PASS_KEY);
    if (botPass === 'true') {
      setAllowed(true);
      setChecking(false);
    } else {
      const target = `/${locale}/bot-fight`;
      if (pathname !== target) {
        router.replace(target);
      }
      setChecking(false);
    }
  }, [pathname, router, locale]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
