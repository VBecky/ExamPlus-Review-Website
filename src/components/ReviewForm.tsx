import { useState, useRef, type FormEvent } from 'react';
import { Star, Send, Check, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import StarRating from './StarRating';
import { supabase } from '@/lib/supabase';
import {
  OVERALL_EXPERIENCE_OPTIONS,
  DESIGN_RATING_OPTIONS,
  USEFUL_FEATURES_OPTIONS,
  USEFULNESS_OPTIONS,
  DESIRED_FEATURES_OPTIONS,
} from '@/types/review';

interface ReviewFormProps {
  onSubmitted: () => void;
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

const MAX_REVIEW_LENGTH = 1000;
const MIN_REVIEW_LENGTH = 10;

export default function ReviewForm({ onSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [overallExperience, setOverallExperience] = useState<string>('');
  const [designRating, setDesignRating] = useState<string>('');
  const [usefulFeatures, setUsefulFeatures] = useState<string[]>([]);
  const [flaggingUsefulness, setFlaggingUsefulness] = useState<string>('');
  const [continueUsefulness, setContinueUsefulness] = useState<string>('');
  const [desiredFeatures, setDesiredFeatures] = useState<string[]>([]);
  const [reviewText, setReviewText] = useState('');
  const [name, setName] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const honeypotRef = useRef<HTMLInputElement>(null);
  const submitTimeRef = useRef<number>(Date.now());

  const toggleInArray = (value: string, arr: string[], setter: (v: string[]) => void) => {
    setter(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  const validate = (): string | null => {
    if (overallExperience === '') return 'Please answer Question 1 (overall experience).';
    if (designRating === '') return 'Please answer Question 2 (design and interface).';
    if (rating === 0) return 'Please tap a star for Question 8 (overall rating).';
    if (reviewText.trim().length > 0 && reviewText.trim().length < MIN_REVIEW_LENGTH)
      return `If writing a comment, please write at least ${MIN_REVIEW_LENGTH} characters.`;
    if (reviewText.length > MAX_REVIEW_LENGTH)
      return `Comment must be under ${MAX_REVIEW_LENGTH} characters.`;
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (honeypotRef.current?.value) return;

    if (Date.now() - submitTimeRef.current < 3000) {
      setErrorMsg('Please take a moment to fill out the form properly.');
      setSubmitState('error');
      return;
    }

    const validationError = validate();
    if (validationError) {
      setErrorMsg(validationError);
      setSubmitState('error');
      return;
    }

    setSubmitState('submitting');
    setErrorMsg('');

    const trimmedName = name.trim();
    const insertData = {
      rating,
      experience_category: overallExperience,
      design_rating: designRating || null,
      useful_features: usefulFeatures.length > 0 ? usefulFeatures : null,
      flagging_usefulness: flaggingUsefulness || null,
      continue_usefulness: continueUsefulness || null,
      desired_features: desiredFeatures.length > 0 ? desiredFeatures : null,
      review_text: reviewText.trim() || 'No additional comment provided.',
      name: trimmedName || null,
    };

    const { error } = await supabase.from('reviews').insert(insertData);

    if (error) {
      setSubmitState('error');
      setErrorMsg('Something went wrong submitting your feedback. Please try again.');
      return;
    }

    setSubmitState('success');
    setRating(0);
    setHoverRating(0);
    setOverallExperience('');
    setDesignRating('');
    setUsefulFeatures([]);
    setFlaggingUsefulness('');
    setContinueUsefulness('');
    setDesiredFeatures([]);
    setReviewText('');
    setName('');
    submitTimeRef.current = Date.now();

    onSubmitted();

    setTimeout(() => setSubmitState('idle'), 5000);
  };

  if (submitState === 'success') {
    return (
      <div
        id="review-form"
        className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-8 sm:p-12 text-center animate-scale-in shadow-lg shadow-green-500/5"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-500/30">
          <Check size={32} className="text-white" strokeWidth={3} />
        </div>
        <h3 className="font-display text-2xl font-bold text-ink-900">Thank You!</h3>
        <p className="mt-3 text-ink-600 max-w-md mx-auto">
          Your feedback has been submitted. It will appear in the community section after
          our team reviews it.
        </p>
        <button
          onClick={() => setSubmitState('idle')}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-5 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
        >
          Submit Another Response
        </button>
      </div>
    );
  }

  const remaining = MAX_REVIEW_LENGTH - reviewText.length;
  const isSubmitting = submitState === 'submitting';

  return (
    <div
      id="review-form"
      className="scroll-mt-20 rounded-2xl border border-ink-200 bg-white p-6 sm:p-8 shadow-xl shadow-ink-900/5"
    >
      <div className="mb-7 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Sparkles size={20} />
        </div>
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ink-900">
            ExamPlus Feedback Survey
          </h2>
          <p className="text-sm text-ink-500">8 questions · about 2 minutes</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Honeypot */}
        <input
          ref={honeypotRef}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="absolute left-[-9999px] opacity-0"
          aria-hidden="true"
        />

        {/* Q1: Overall experience */}
        <fieldset>
          <QuestionLabel number={1} text="How would you rate your overall experience with ExamPlus?" required />
          <div className="flex flex-wrap gap-2">
            {OVERALL_EXPERIENCE_OPTIONS.map((opt) => (
              <OptionButton
                key={opt}
                label={opt}
                selected={overallExperience === opt}
                onClick={() => setOverallExperience(opt)}
              />
            ))}
          </div>
        </fieldset>

        {/* Q2: Design and interface */}
        <fieldset>
          <QuestionLabel number={2} text="How do you find ExamPlus's design and interface?" required />
          <div className="flex flex-wrap gap-2">
            {DESIGN_RATING_OPTIONS.map((opt) => (
              <OptionButton
                key={opt}
                label={opt}
                selected={designRating === opt}
                onClick={() => setDesignRating(opt)}
              />
            ))}
          </div>
        </fieldset>

        {/* Q3: Most useful features (multi-select) */}
        <fieldset>
          <QuestionLabel
            number={3}
            text="Which ExamPlus feature do you find most useful?"
            hint="Select all that apply"
          />
          <div className="flex flex-wrap gap-2">
            {USEFUL_FEATURES_OPTIONS.map((opt) => (
              <MultiSelectButton
                key={opt}
                label={opt}
                selected={usefulFeatures.includes(opt)}
                onClick={() => toggleInArray(opt, usefulFeatures, setUsefulFeatures)}
              />
            ))}
          </div>
        </fieldset>

        {/* Q4: Flagging usefulness */}
        <fieldset>
          <QuestionLabel
            number={4}
            text="How useful is the Question Flagging feature for marking difficult questions and reviewing them later?"
          />
          <div className="flex flex-wrap gap-2">
            {USEFULNESS_OPTIONS.map((opt) => (
              <OptionButton
                key={opt}
                label={opt}
                selected={flaggingUsefulness === opt}
                onClick={() => setFlaggingUsefulness(opt)}
              />
            ))}
          </div>
        </fieldset>

        {/* Q5: Continue where left off */}
        <fieldset>
          <QuestionLabel
            number={5}
            text="How useful is the feature that allows you to continue an examination from where you stopped, even after closing the app?"
          />
          <div className="flex flex-wrap gap-2">
            {USEFULNESS_OPTIONS.map((opt) => (
              <OptionButton
                key={opt}
                label={opt}
                selected={continueUsefulness === opt}
                onClick={() => setContinueUsefulness(opt)}
              />
            ))}
          </div>
        </fieldset>

        {/* Q6: Desired future features (multi-select) */}
        <fieldset>
          <QuestionLabel
            number={6}
            text="Which features would you like to see in future ExamPlus updates?"
            hint="Select all that apply — or skip this one if nothing stands out"
          />
          <div className="flex flex-wrap gap-2">
            {DESIRED_FEATURES_OPTIONS.map((opt) => (
              <MultiSelectButton
                key={opt}
                label={opt}
                selected={desiredFeatures.includes(opt)}
                onClick={() => toggleInArray(opt, desiredFeatures, setDesiredFeatures)}
              />
            ))}
          </div>
        </fieldset>

        {/* Q7: Love / improve (optional text) */}
        <fieldset>
          <QuestionLabel
            number={7}
            text="What is one thing you love about ExamPlus, and what is one thing you think we should improve?"
            hint="Optional"
          />
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value.slice(0, MAX_REVIEW_LENGTH))}
            placeholder="I love… / I wish ExamPlus would improve…"
            rows={4}
            className="w-full resize-none rounded-xl border border-ink-200 bg-ink-50/50 px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 transition-all focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          {reviewText.length > 0 && (
            <div className="mt-1.5 flex justify-end text-xs">
              <span className={remaining < 100 ? 'text-accent-600' : 'text-ink-400'}>
                {remaining} characters left
              </span>
            </div>
          )}
        </fieldset>

        {/* Q8: Name (optional) */}
        <fieldset>
          <QuestionLabel number={8} text="Your Name" hint="Optional — leave blank to stay anonymous" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 100))}
            placeholder="No email or phone number needed — anonymous feedback is welcome"
            className="w-full rounded-xl border border-ink-200 bg-ink-50/50 px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 transition-all focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </fieldset>

        {/* Overall star rating (Q8 in the list) */}
        <fieldset className="rounded-xl bg-ink-50/60 p-4 ring-1 ring-ink-100">
          <legend className="mb-2.5 text-sm font-semibold text-ink-800">
            Overall, how would you rate ExamPlus? <span className="text-red-500">*</span>
            <span className="ml-1.5 text-xs font-normal text-ink-400">Tap a star</span>
          </legend>
          <div className="flex items-center gap-3">
            <StarRating
              value={rating}
              interactive
              size="lg"
              onChange={setRating}
              hoverValue={hoverRating}
              onHover={setHoverRating}
            />
            {rating > 0 && (
              <span className="animate-fade-in text-sm font-medium text-ink-500">
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
              </span>
            )}
          </div>
        </fieldset>

        {/* Error */}
        {submitState === 'error' && (
          <div className="animate-slide-down flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-sm text-red-700">{errorMsg}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-500/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send size={18} className="transition-transform group-hover:translate-x-0.5" />
              Submit Feedback
            </>
          )}
        </button>

        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-ink-400">
          <Star size={12} className="fill-accent-400 text-accent-400" />
          Your feedback will be visible after approval by our team.
        </p>
      </form>
    </div>
  );
}

function QuestionLabel({
  number,
  text,
  required = false,
  hint,
}: {
  number: number;
  text: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <legend className="mb-2.5 text-sm font-semibold text-ink-800">
      <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-700">
        {number}
      </span>
      {text}
      {required && <span className="text-red-500"> *</span>}
      {hint && <span className="ml-1.5 text-xs font-normal text-ink-400">{hint}</span>}
    </legend>
  );
}

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
        selected
          ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 ring-1 ring-brand-500'
          : 'bg-ink-50 text-ink-700 ring-1 ring-ink-200 hover:bg-ink-100 hover:ring-ink-300'
      }`}
    >
      {label}
    </button>
  );
}

function MultiSelectButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
        selected
          ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-300'
          : 'bg-ink-50 text-ink-600 ring-1 ring-ink-200 hover:bg-ink-100'
      }`}
    >
      {selected && <Check size={14} className="text-brand-600" strokeWidth={3} />}
      {label}
    </button>
  );
}
