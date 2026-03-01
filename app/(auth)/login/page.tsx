import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Contract Manager</h1>
        <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <LoginForm />
      </div>
    </div>
  );
}
