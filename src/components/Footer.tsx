import { Shield, Heart } from 'lucide-react';
import Logo from './Logo';

interface FooterProps {
  onAdminClick: () => void;
}

export default function Footer({ onAdminClick }: FooterProps) {
  return (
    <footer className="border-t border-ink-200 bg-white">
      <div className="mx-auto max-w-4xl px-5 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo size="sm" />
          <p className="flex items-center gap-1.5 text-xs text-ink-400">
            Made with <Heart size={12} className="fill-red-400 text-red-400" /> for students
          </p>
          <button
            onClick={onAdminClick}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-400 transition-colors hover:text-ink-600"
          >
            <Shield size={13} />
            Admin
          </button>
        </div>
      </div>
    </footer>
  );
}
