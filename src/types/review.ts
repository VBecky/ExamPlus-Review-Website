export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export const OVERALL_EXPERIENCE_OPTIONS = [
  'Excellent',
  'Very good',
  'Good',
  'Fair',
  'Poor',
] as const;

export const DESIGN_RATING_OPTIONS = [
  'Excellent and professional',
  'Clean and easy to use',
  'Good, but needs improvement',
  'Confusing in some areas',
  'Needs a complete redesign',
] as const;

export const USEFUL_FEATURES_OPTIONS = [
  'Practicing examination questions',
  'Question navigation',
  'Question flagging',
  'Continue where I left off',
  'Offline exam access',
  'Daily goal setting',
  'Progress tracking',
  'Other',
] as const;

export const USEFULNESS_OPTIONS = [
  'Extremely useful',
  'Very useful',
  'Somewhat useful',
  'Not useful',
  "I haven't tried it yet",
] as const;

export const DESIRED_FEATURES_OPTIONS = [
  'AI Tutor',
  'Detailed answer explanations',
  'Study Notes and Summaries',
  'More examination questions',
  'Improved offline experience',
  'Better progress analytics',
  'Other',
] as const;

export interface Review {
  id: string;
  name: string | null;
  rating: number;
  experience_category: string;
  liked_features: string[] | null;
  review_text: string;
  design_rating: string | null;
  useful_features: string[] | null;
  flagging_usefulness: string | null;
  continue_usefulness: string | null;
  desired_features: string[] | null;
  status: ReviewStatus;
  created_at: string;
}

export interface ReviewInsert {
  name?: string | null;
  rating: number;
  experience_category: string;
  liked_features?: string[] | null;
  review_text: string;
  design_rating?: string | null;
  useful_features?: string[] | null;
  flagging_usefulness?: string | null;
  continue_usefulness?: string | null;
  desired_features?: string[] | null;
}

export interface RatingStats {
  average: number;
  total: number;
  distribution: Record<number, number>;
}

export function calculateStats(reviews: Review[]): RatingStats {
  const total = reviews.length;
  if (total === 0) {
    return {
      average: 0,
      total: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const r of reviews) {
    distribution[r.rating] = (distribution[r.rating] ?? 0) + 1;
  }
  return {
    average: sum / total,
    total,
    distribution,
  };
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
