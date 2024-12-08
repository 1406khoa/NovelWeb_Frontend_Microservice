import React from "react";
import { Mail, Lock, User } from "lucide-react";

export function AuthForm({
  type,
  onSubmit,
  email,
  setEmail,
  password,
  setPassword,
  username,
  setUsername,
  error,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {type === "signup" && (
        <div className="space-y-1">
          <label
            htmlFor={`username-${type}`}
            className="block text-sm font-medium text-gray-700"
          >
            Username
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id={`username-${type}`}
              type="text"
              value={username || ""}
              onChange={(e) => setUsername && setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter your username"
              autoComplete="username"
              required
            />
          </div>
        </div>
      )}

      <div className="space-y-1">
        <label
          htmlFor={`email-${type}`}
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            id={`email-${type}`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter your email"
            required
            autoComplete="email"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label
          htmlFor={`password-${type}`}
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            id={`password-${type}`}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter your password"
            required
            autoComplete={type === "signin" ? "current-password" : "new-password"}
          />
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-blue-300/50"
      >
        {type === "signin" ? "Sign In" : "Create Account"}
      </button>
    </form>
  );
}
export default AuthForm;