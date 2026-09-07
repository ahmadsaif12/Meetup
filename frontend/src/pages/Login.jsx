import { SignIn, SignUp, useUser } from '@clerk/react';
import { Navigate } from 'react-router-dom';
import { Video, Zap, ShieldCheck, MessagesSquare, Sparkles } from 'lucide-react';

const clerkAppearance = {
  variables: {
    colorPrimary: '#004cff',
    colorText: '#1e293b',
    colorBackground: '#ffffff',
    colorInputBackground: '#f8fafc',
    colorInputText: '#1e293b',
    colorNeutral: '#64748b',
    borderRadius: '0.75rem',
    fontFamily: '"Urbanist", sans-serif',
  },
  elements: {
    card: 'rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-100 overflow-hidden',
    header: 'px-6 pt-8',
    headerTitle: 'text-2xl font-bold text-slate-900',
    headerSubtitle: 'text-slate-500 text-sm mt-1',
    formButtonPrimary:
      'bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30',
    formFieldInput:
      'rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 py-2.5 px-3.5 text-sm transition-all duration-200',
    formFieldLabel: 'text-slate-600 font-medium text-sm mb-1.5',
    socialButtonsBlockButton:
      'border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl font-medium text-sm py-2.5 transition-all duration-200',
    socialButtonsBlockButtonText: 'text-slate-700 font-medium',
    dividerLine: 'bg-slate-200',
    dividerText: 'text-slate-400 text-xs font-medium',
    footerActionText: 'text-slate-500 text-sm',
    footerActionLink: 'text-primary hover:text-primary-hover font-semibold',
    formFieldErrorText: 'text-red-500 text-xs',
    formFieldError: 'bg-red-50/50 border-red-200',
    formFieldLabelRow: 'flex items-center justify-between',
  },
};

const features = [
  { icon: Video, text: 'HD video calls' },
  { icon: Zap, text: 'Ultra-low latency' },
  { icon: ShieldCheck, text: 'End-to-end encrypted' },
  { icon: MessagesSquare, text: 'Real-time chat' },
];

const Login = ({ mode = 'login' }) => {
  const isRegister = mode === 'register';

  const { isLoaded, isSignedIn } = useUser();

  if (isLoaded && isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 font-sans">
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-primary to-primary-hover p-12 text-white">
        <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-primary-light/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-slate-900/40 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <img src="/logo.svg" alt="Meetup logo" className="h-8 w-auto brightness-0 invert" />
          <span className="text-xl font-bold tracking-tight">
            Meetup<span className="text-sky-300">.</span>
          </span>
        </div>

        <div className="relative space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
            <Sparkles size={16} className="text-sky-300" />
            Connect from anywhere
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
            Every conversation,
            <br />
            beautifully simple.
          </h1>

          <ul className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-slate-100">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                  <Icon size={18} className="text-sky-300" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-slate-300">
          Trusted by teams who love simple, secure meetings.
        </p>
      </aside>

      <main className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-10 sm:px-6">
        <div className="pointer-events-none absolute -top-28 left-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-primary-light/20 blur-3xl" />

        <div className="relative w-full max-w-md">
          <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
            <img src="/logo.svg" alt="Meetup logo" className="h-10 w-auto" />
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              Meetup<span className="text-primary">.</span>
            </span>
          </div>

          {isRegister ? (
            <SignUp
              routing="path"
              path="/register"
              fallbackRedirectUrl="/dashboard"
              appearance={clerkAppearance}
            />
          ) : (
            <SignIn
              routing="path"
              path="/login"
              fallbackRedirectUrl="/dashboard"
              appearance={clerkAppearance}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Login;