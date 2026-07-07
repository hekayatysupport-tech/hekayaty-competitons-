import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Layout } from '@/components/Layout';

import { lazy, Suspense } from 'react';

// Lazy loaded pages
const LandingPage = lazy(() => import('@/pages/LandingPage').then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const PaymentPage = lazy(() => import('@/pages/PaymentPage').then(m => ({ default: m.PaymentPage })));
const SuccessPage = lazy(() => import('@/pages/SuccessPage').then(m => ({ default: m.SuccessPage })));
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const AdminPage = lazy(() => import('@/pages/AdminPage').then(m => ({ default: m.AdminPage })));
const AdminSetupPage = lazy(() => import('@/pages/AdminSetupPage').then(m => ({ default: m.AdminSetupPage })));
const UploadNovelPage = lazy(() => import('@/pages/UploadNovelPage').then(m => ({ default: m.UploadNovelPage })));
const UploadSubmissionPage = lazy(() => import('@/pages/UploadSubmissionPage').then(m => ({ default: m.UploadSubmissionPage })));
const SubmissionStatusPage = lazy(() => import('@/pages/SubmissionStatusPage').then(m => ({ default: m.SubmissionStatusPage })));
const NotFound = lazy(() => import('@/pages/not-found'));

const queryClient = new QueryClient();

// Premium loading fallback
function PageLoader() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <p className="text-primary/60 font-serif tracking-widest text-sm uppercase animate-pulse">جاري التحميل...</p>
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/" component={LandingPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/payment" component={PaymentPage} />
          <Route path="/success" component={SuccessPage} />
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/admin" component={AdminPage} />
          <Route path="/admin-setup" component={AdminSetupPage} />
          <Route path="/upload-novel" component={UploadNovelPage} />
          <Route path="/upload-submission" component={UploadSubmissionPage} />
          <Route path="/submission-status" component={SubmissionStatusPage} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster position="top-center" theme="dark" />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
