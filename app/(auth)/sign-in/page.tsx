import { AuthForm } from "@/app/(auth)/auth-form";
import { signIn } from "@/app/(auth)/actions";

export default function SignInPage() {
  return (
    <>
      <h1 className="mt-8 text-3xl font-semibold tracking-tight">
        Welcome back
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Sign in to access your conversations.
      </p>
      <div className="mt-8">
        <AuthForm action={signIn} mode="sign-in" />
      </div>
    </>
  );
}
