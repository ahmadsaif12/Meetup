import { SignIn, SignUp, useUser } from '@clerk/react';
import { Navigate } from 'react-router-dom';

const Login = ({ mode = 'login' }) => {
  const isRegister = mode === 'register';

  const { isLoaded, isSignedIn } = useUser();

  if (isLoaded && isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen w-full bg-[url('/login_bg.png')] text-slate-800 p-4 md:p-6 lg:p-8 font-sans flex items-center justify-center">
      <div className="w-full justify-center py-2">
        {isRegister ? (
          <SignUp
            routing="path"
            path="/register"
            fallbackRedirectUrl="/dashboard"
          />
        ) : (
          <SignIn
            routing="path"
            path="/login"
            fallbackRedirectUrl="/dashboard"
          />
        )}
      </div>
    </div>
  );
};

export default Login;

