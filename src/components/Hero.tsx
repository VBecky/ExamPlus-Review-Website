import { ArrowDown, Heart } from 'lucide-react';
import Logo from './Logo';

interface HeroProps {
  onWriteReview: () => void;
}

export default function Hero({ onWriteReview }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute -bottom-32 right-1/3 w-72 h-72 rounded-full bg-accent-400/5 blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none' stroke='white' stroke-width='0.5'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative mx-auto max-w-3xl px-5 pt-20 pb-16 sm:pt-28 sm:pb-24 text-center">
        <div className="animate-fade-in-up">
          <Logo size="lg" showText={false} className="mx-auto mb-6" />
        </div>

        <h1 className="animate-fade-in-up font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight text-balance" style={{ animationDelay: '0.05s' }}>
          Help Us Make{' '}
          <span className="bg-gradient-to-r from-brand-300 to-brand-100 bg-clip-text text-transparent">
            ExamPlus
          </span>{' '}
          Better!
        </h1>

        <p className="animate-fade-in-up mt-5 text-base sm:text-lg text-brand-100/80 leading-relaxed max-w-2xl mx-auto text-balance" style={{ animationDelay: '0.1s' }}>
          Your feedback matters. Tell us about your experience using ExamPlus. Your suggestions
          and honest reviews will help us build a better learning experience for every student.
        </p>

        <div className="animate-fade-in-up mt-8 flex flex-col items-center gap-3" style={{ animationDelay: '0.15s' }}>
          <button
            onClick={onWriteReview}
            className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-brand-700 shadow-xl shadow-brand-950/30 transition-all hover:shadow-2xl hover:shadow-brand-950/40 hover:scale-[1.02] active:scale-[0.98] hover:bg-brand-50"
          >
            Write a Review
            <ArrowDown size={18} className="transition-transform group-hover:translate-y-0.5" />
          </button>
          <p className="flex items-center gap-1.5 text-sm text-brand-200/70">
            <Heart size={13} className="fill-accent-400 text-accent-400" />
            Your voice helps us improve
          </p>
        </div>
      </div>

      {/* Bottom wave */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full"
        viewBox="0 0 1440 60"
        fill="none"
        preserveAspectRatio="none"
        style={{ height: '40px' }}
      >
        <path d="M0 60L60 55C120 50 240 40 360 35C480 30 600 30 720 33C840 36 960 42 1080 45C1200 48 1320 48 1380 48L1440 48V60H0Z" fill="#f6f7f9" />
      </svg>
    </section>
  );
}
