import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Hero from '@/components/Hero';
import ReviewForm from '@/components/ReviewForm';
import CommunityReviews from '@/components/CommunityReviews';
import Footer from '@/components/Footer';
import AdminLogin from '@/components/AdminLogin';
import AdminPanel from '@/components/AdminPanel';

type View = 'public' | 'admin-login' | 'admin-panel';

export default function App() {
  const [view, setView] = useState<View>('public');
  const [reviewsRefreshKey, setReviewsRefreshKey] = useState(0);
  const [authChecked, setAuthChecked] = useState(false);

  const checkAdminStatus = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      const { data: isAdmin } = await supabase.rpc('is_admin');
      if (isAdmin) {
        setView('admin-panel');
      }
    }
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    checkAdminStatus();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session) {
          const { data: isAdmin } = await supabase.rpc('is_admin');
          if (isAdmin) {
            setView('admin-panel');
          }
        } else {
          if (view !== 'public') {
            setView('public');
          }
        }
      })();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [checkAdminStatus]);

  const scrollToForm = () => {
    document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleReviewSubmitted = () => {
    setReviewsRefreshKey((k) => k + 1);
  };

  const handleAdminClick = () => {
    setView('admin-login');
  };

  const handleAdminLoginSuccess = () => {
    setView('admin-panel');
  };

  const handleAdminBack = () => {
    setView('public');
  };

  const handleAdminSignOut = () => {
    setView('public');
  };

  const handleViewPublic = () => {
    setView('public');
  };

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (view === 'admin-login') {
    return <AdminLogin onSuccess={handleAdminLoginSuccess} onBack={handleAdminBack} />;
  }

  if (view === 'admin-panel') {
    return <AdminPanel onSignOut={handleAdminSignOut} onViewPublic={handleViewPublic} />;
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <Hero onWriteReview={scrollToForm} />

      <main className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
        <ReviewForm onSubmitted={handleReviewSubmitted} />
      </main>

      <CommunityReviews key={reviewsRefreshKey} />

      <Footer onAdminClick={handleAdminClick} />
    </div>
  );
}
