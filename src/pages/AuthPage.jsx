import React, { useState } from 'react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        
        <form className="space-y-4">
          {!isLogin && (
            <input type="text" placeholder="Full Name" className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-400 outline-none transition" />
          )}
          <input type="email" placeholder="Email Address" className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-400 outline-none transition" />
          <input type="password" placeholder="Password" className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-400 outline-none transition" />
          
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-lg transform transition active:scale-95">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-indigo-600 font-semibold hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;