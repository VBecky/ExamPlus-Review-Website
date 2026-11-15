import { useEffect, useState, useCallback } from 'react';
import { Star, MessageSquare, TrendingUp, Loader2, Inbox, ChevronDown } from 'lucide-react';
import StarRating from './StarRating';
import { supabase } from '@/lib/supabase';
import {
  type Review,
  type RatingStats,
  calculateStats,
  formatDate,
} from '@/types/review';

const PAGE_SIZE = 6;
const REVIEW_FIELDS =
  'id, name, rating, experience_category, liked_features, review_text, design_rating, useful_features, flagging_usefulness, continue_usefulness, desired_features, status, created_at';

type LoadingState = 'loading' | 'loaded' | 'error';

export default function CommunityReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<RatingStats>({
    average: 0,
    total: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchReviews = useCallback(async () => {
    setLoadingState('loading');
    const { data, error } = await supabase
      .from('reviews')
      .select(REVIEW_FIELDS)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      setLoadingState('error');
      return;
    }

    const typedReviews = (data ?? []) as Review[];
    setReviews(typedReviews);
    setStats(calculateStats(typedReviews));
    setLoadingState('loaded');
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews, refreshKey]);

  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < reviews.length;

  if (loadingState === 'loading') {
    return (
      <section id="reviews" className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
        <div className="flex flex-col items-center gap-3 py-12">
          <Loader2 size={28} className="animate-spin text-brand-500" />
          <p className="text-sm text-ink-500">Loading community reviews...</p>
        </div>
      </section>
    );
  }

  if (loadingState === 'error') {
    return (
      <section id="reviews" className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-medium text-red-700">
            Couldn't load reviews. Please check your connection and try again.
          </p>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="reviews" className="mx-auto max-w-4xl px-5 py-12 sm:py-16 scroll-mt-20">
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
          <MessageSquare size={13} />
          Community Reviews
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">
          What Students Are Saying
        </h2>
      </div>

      {reviews.length === 0 ? (
        <EmptyState onRefresh={() => setRefreshKey((k) => k + 1)} />
      ) : (
        <>
          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-ink-200 bg-white p-5 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Average Rating</p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="font-display text-3xl font-extrabold text-ink-900">{stats.average.toFixed(1)}</span>
                <Star size={24} className="fill-accent-400 text-accent-400" />
              </div>
              <div className="mt-2 flex justify-center">
                <StarRating value={Math.round(stats.average)} size="sm" />
              </div>
            </div>

            <div className="rounded-2xl border border-ink-200 bg-white p-5 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Total Reviews</p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="font-display text-3xl font-extrabold text-ink-900">{stats.total}</span>
              </div>
              <p className="mt-2 text-xs text-ink-500">from real ExamPlus users</p>
            </div>

            <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm">
              <p className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-400">
                <TrendingUp size={13} />
                Rating Breakdown
              </p>
              <div className="space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats.distribution[star] ?? 0;
                  const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="flex w-6 shrink-0 items-center gap-0.5 text-xs font-medium text-ink-600">
                        {star}
                        <Star size={10} className="fill-accent-400 text-accent-400" />
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                        <div className="h-full rounded-full bg-accent-400 transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-6 shrink-0 text-right text-xs font-medium text-ink-400">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="grid gap-4 sm:grid-cols-2">
            {visibleReviews.map((review, index) => (
              <ReviewCard key={review.id} review={review} index={index} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="group inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-6 py-3 text-sm font-semibold text-ink-700 shadow-sm transition-all hover:border-brand-300 hover:text-brand-600 hover:shadow-md"
              >
                Load More Reviews
                <ChevronDown size={16} className="transition-transform group-hover:translate-y-0.5" />
              </button>
            </div>
          )}

          {!hasMore && reviews.length > PAGE_SIZE && (
            <p className="mt-8 text-center text-sm text-ink-400">
              You've seen all {reviews.length} reviews. Thank you for reading!
            </p>
          )}
        </>
      )}
    </section>
  );
}

function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-300 bg-white/50 p-12 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ink-100">
        <Inbox size={28} className="text-ink-400" />
      </div>
      <h3 className="font-display text-lg font-bold text-ink-800">No Reviews Yet</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink-500">
        Be the first to share your ExamPlus experience. Your feedback will appear here after it's approved.
      </p>
      <button onClick={onRefresh} className="mt-5 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700">
        Refresh
      </button>
    </div>
  );
}

function ReviewCard({ review, index }: { review: Review; index: number }) {
  const displayName = review.name?.trim() || 'Anonymous Student';
  const initials = review.name?.trim()
    ? review.name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('')
    : 'AS';

  const tags: { label: string; value: string }[] = [];
  if (review.experience_category) tags.push({ label: 'Experience', value: review.experience_category });
  if (review.design_rating) tags.push({ label: 'Design', value: review.design_rating });
  if (review.flagging_usefulness) tags.push({ label: 'Flagging', value: review.flagging_usefulness });
  if (review.continue_usefulness) tags.push({ label: 'Continue', value: review.continue_usefulness });

  const featureTags: string[] = [
    ...(review.useful_features ?? []),
    ...(review.desired_features ?? []),
  ];

  return (
    <article
      className="animate-fade-in-up flex flex-col rounded-2xl border border-ink-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-ink-300"
      style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s`, opacity: 0 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-900">{displayName}</p>
            <p className="text-xs text-ink-400">{formatDate(review.created_at)}</p>
          </div>
        </div>
        <StarRating value={review.rating} size="sm" />
      </div>

      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span key={tag.label} className="inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 ring-1 ring-brand-100">
              {tag.value}
            </span>
          ))}
        </div>
      )}

      <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-600 whitespace-pre-wrap break-words">
        {review.review_text}
      </p>

      {featureTags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-ink-100 pt-3">
          {featureTags.map((feature) => (
            <span key={feature} className="inline-flex items-center rounded-md bg-ink-50 px-2 py-0.5 text-xs font-medium text-ink-500 ring-1 ring-ink-100">
              {feature}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
