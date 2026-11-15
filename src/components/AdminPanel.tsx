import { useEffect, useState, useCallback } from 'react';
import {
  LogOut,
  Check,
  X,
  Trash2,
  Loader2,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  Inbox,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  type Review,
  type RatingStats,
  calculateStats,
  formatDate,
} from '@/types/review';
import StarRating from './StarRating';
import Logo from './Logo';

interface AdminPanelProps {
  onSignOut: () => void;
  onViewPublic: () => void;
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';
type LoadingState = 'loading' | 'loaded' | 'error';

const PAGE_SIZE = 10;

export default function AdminPanel({ onSignOut, onViewPublic }: AdminPanelProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<RatingStats>({
    average: 0,
    total: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [filter, setFilter] = useState<FilterStatus>('pending');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchReviews = useCallback(async () => {
    setLoadingState('loading');
    const { data, error } = await supabase
      .from('reviews')
      .select(
        'id, name, rating, experience_category, liked_features, review_text, design_rating, useful_features, flagging_usefulness, continue_usefulness, desired_features, status, created_at'
      )
      .order('created_at', { ascending: false });

    if (error) {
      setLoadingState('error');
      return;
    }

    const typedReviews = (data ?? []) as Review[];
    setAllReviews(typedReviews);
    setStats(calculateStats(typedReviews));
    setPendingCount(typedReviews.filter((r) => r.status === 'pending').length);
    setLoadingState('loaded');
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    const filtered =
      filter === 'all'
        ? allReviews
        : allReviews.filter((r) => r.status === filter);
    setReviews(filtered);
    setVisibleCount(PAGE_SIZE);
  }, [filter, allReviews]);

  const updateReviewStatus = async (id: string, status: 'approved' | 'rejected') => {
    setActionLoading(`status-${id}`);
    const { error } = await supabase
      .from('reviews')
      .update({ status })
      .eq('id', id);

    if (error) {
      setActionLoading(null);
      return;
    }

    setAllReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    setActionLoading(null);
  };

  const deleteReview = async (id: string) => {
    setActionLoading(`delete-${id}`);
    const { error } = await supabase.from('reviews').delete().eq('id', id);

    if (error) {
      setActionLoading(null);
      return;
    }

    setAllReviews((prev) => prev.filter((r) => r.id !== id));
    setDeleteConfirmId(null);
    setActionLoading(null);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onSignOut();
  };

  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < reviews.length;

  const filterTabs: { key: FilterStatus; label: string; count: number }[] = [
    { key: 'pending', label: 'Pending', count: allReviews.filter((r) => r.status === 'pending').length },
    { key: 'approved', label: 'Approved', count: allReviews.filter((r) => r.status === 'approved').length },
    { key: 'rejected', label: 'Rejected', count: allReviews.filter((r) => r.status === 'rejected').length },
    { key: 'all', label: 'All', count: allReviews.length },
  ];

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Admin header */}
      <header className="sticky top-0 z-20 border-b border-ink-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onViewPublic}
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 sm:block"
            >
              View Public Site
            </button>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3.5 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">
        <h1 className="font-display text-2xl font-bold text-ink-900">Review Moderation</h1>
        <p className="mt-1 text-sm text-ink-500">
          Approve, reject, or delete submitted reviews from ExamPlus users.
        </p>

        {/* Stats overview */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total Reviews" value={stats.total} icon={<Star size={16} className="text-brand-500" />} />
          <StatCard
            label="Pending"
            value={pendingCount}
            icon={<Clock size={16} className="text-accent-500" />}
            highlight={pendingCount > 0}
          />
          <StatCard label="Avg Rating" value={stats.total > 0 ? stats.average.toFixed(1) : '—'} icon={<Star size={16} className="fill-accent-400 text-accent-400" />} />
          <StatCard label="Approved" value={allReviews.filter((r) => r.status === 'approved').length} icon={<CheckCircle2 size={16} className="text-green-500" />} />
        </div>

        {/* Rating distribution */}
        {stats.total > 0 && (
          <div className="mt-4 rounded-xl border border-ink-200 bg-white p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-400">
              Rating Distribution
            </p>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.distribution[star] ?? 0;
                const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="flex w-8 shrink-0 items-center gap-0.5 text-xs font-medium text-ink-600">
                      {star}
                      <Star size={10} className="fill-accent-400 text-accent-400" />
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                      <div
                        className="h-full rounded-full bg-accent-400 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right text-xs font-medium text-ink-400">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="mt-6 flex gap-1.5 overflow-x-auto no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                filter === tab.key
                  ? 'bg-ink-900 text-white shadow-sm'
                  : 'bg-white text-ink-600 ring-1 ring-ink-200 hover:bg-ink-50'
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs ${
                  filter === tab.key ? 'bg-white/20 text-white' : 'bg-ink-100 text-ink-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Reviews */}
        <div className="mt-5">
          {loadingState === 'loading' && (
            <div className="flex flex-col items-center gap-3 py-12">
              <Loader2 size={24} className="animate-spin text-brand-500" />
              <p className="text-sm text-ink-500">Loading reviews...</p>
            </div>
          )}

          {loadingState === 'error' && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
              <AlertCircle size={24} className="mx-auto mb-2 text-red-500" />
              <p className="text-sm font-medium text-red-700">
                Failed to load reviews. Please try again.
              </p>
              <button
                onClick={fetchReviews}
                className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                Retry
              </button>
            </div>
          )}

          {loadingState === 'loaded' && reviews.length === 0 && (
            <div className="rounded-xl border border-dashed border-ink-300 bg-white/50 p-12 text-center">
              <Inbox size={28} className="mx-auto mb-3 text-ink-300" />
              <p className="text-sm font-medium text-ink-600">
                No {filter !== 'all' ? filter : ''} reviews to show.
              </p>
            </div>
          )}

          {loadingState === 'loaded' && visibleReviews.length > 0 && (
            <div className="space-y-3">
              {visibleReviews.map((review) => (
                <AdminReviewCard
                  key={review.id}
                  review={review}
                  actionLoading={actionLoading}
                  onApprove={() => updateReviewStatus(review.id, 'approved')}
                  onReject={() => updateReviewStatus(review.id, 'rejected')}
                  onDelete={() => setDeleteConfirmId(review.id)}
                  deleteConfirmId={deleteConfirmId}
                  onConfirmDelete={() => deleteReview(review.id)}
                  onCancelDelete={() => setDeleteConfirmId(null)}
                />
              ))}
            </div>
          )}

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="group inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-5 py-2.5 text-sm font-medium text-ink-700 transition-all hover:border-ink-300 hover:shadow-sm"
              >
                Load More
                <ChevronDown size={15} className="transition-transform group-hover:translate-y-0.5" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight
          ? 'border-accent-300 bg-accent-50'
          : 'border-ink-200 bg-white'
      }`}
    >
      <div className="flex items-center gap-1.5">
        {icon}
        <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</p>
      </div>
      <p className="mt-1.5 font-display text-2xl font-bold text-ink-900">{value}</p>
    </div>
  );
}

function AdminReviewCard({
  review,
  actionLoading,
  onApprove,
  onReject,
  onDelete,
  deleteConfirmId,
  onConfirmDelete,
  onCancelDelete,
}: {
  review: Review;
  actionLoading: string | null;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  deleteConfirmId: string | null;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}) {
  const displayName = review.name?.trim() || 'Anonymous Student';
  const isStatusLoading = actionLoading === `status-${review.id}`;
  const isDeleteLoading = actionLoading === `delete-${review.id}`;
  const isDeleteConfirm = deleteConfirmId === review.id;

  const statusBadge = {
    pending: { label: 'Pending', class: 'bg-accent-50 text-accent-700 ring-accent-200', icon: <Clock size={11} /> },
    approved: { label: 'Approved', class: 'bg-green-50 text-green-700 ring-green-200', icon: <CheckCircle2 size={11} /> },
    rejected: { label: 'Rejected', class: 'bg-red-50 text-red-700 ring-red-200', icon: <XCircle size={11} /> },
  }[review.status];

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white">
            {(review.name?.trim() || 'AS')
              .split(/\s+/)
              .slice(0, 2)
              .map((w) => w[0]?.toUpperCase())
              .join('')}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-900">{displayName}</p>
            <p className="text-xs text-ink-400">{formatDate(review.created_at)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarRating value={review.rating} size="sm" />
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${statusBadge.class}`}
          >
            {statusBadge.icon}
            {statusBadge.label}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {review.experience_category && (
          <span className="inline-flex rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 ring-1 ring-brand-100">
            Q1: {review.experience_category}
          </span>
        )}
        {review.design_rating && (
          <span className="inline-flex rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 ring-1 ring-brand-100">
            Q2: {review.design_rating}
          </span>
        )}
      </div>

      {(review.flagging_usefulness || review.continue_usefulness) && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {review.flagging_usefulness && (
            <span className="inline-flex rounded-md bg-ink-50 px-2 py-0.5 text-xs font-medium text-ink-600 ring-1 ring-ink-100">
              Flagging: {review.flagging_usefulness}
            </span>
          )}
          {review.continue_usefulness && (
            <span className="inline-flex rounded-md bg-ink-50 px-2 py-0.5 text-xs font-medium text-ink-600 ring-1 ring-ink-100">
              Continue: {review.continue_usefulness}
            </span>
          )}
        </div>
      )}

      <p className="mt-3 text-sm leading-relaxed text-ink-600 whitespace-pre-wrap break-words">
        {review.review_text}
      </p>

      {(review.useful_features?.length || review.desired_features?.length) && (
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-ink-100 pt-3">
          {review.useful_features?.map((f) => (
            <span key={`u-${f}`} className="inline-flex items-center rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-green-100">
              {f}
            </span>
          ))}
          {review.desired_features?.map((f) => (
            <span key={`d-${f}`} className="inline-flex items-center rounded-md bg-ink-50 px-2 py-0.5 text-xs font-medium text-ink-500 ring-1 ring-ink-100">
              Wants: {f}
            </span>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-4">
        {isDeleteConfirm ? (
          <div className="flex w-full items-center justify-between gap-2 rounded-lg bg-red-50 p-2.5">
            <span className="text-xs font-medium text-red-700">
              Delete this review permanently?
            </span>
            <div className="flex gap-2">
              <button
                onClick={onConfirmDelete}
                disabled={isDeleteLoading}
                className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {isDeleteLoading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                Delete
              </button>
              <button
                onClick={onCancelDelete}
                className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-600 transition-colors hover:bg-ink-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {review.status !== 'approved' && (
              <button
                onClick={onApprove}
                disabled={isStatusLoading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60"
              >
                {isStatusLoading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                Approve
              </button>
            )}
            {review.status !== 'rejected' && (
              <button
                onClick={onReject}
                disabled={isStatusLoading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-ink-300 bg-white px-3.5 py-2 text-xs font-semibold text-ink-700 transition-colors hover:bg-ink-50 disabled:opacity-60"
              >
                {isStatusLoading ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
                Reject
              </button>
            )}
            <button
              onClick={onDelete}
              disabled={isStatusLoading || isDeleteLoading}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3.5 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
            >
              <Trash2 size={13} />
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
