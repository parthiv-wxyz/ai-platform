import { AuthForm } from "@/app/(auth)/auth-form";
import { signUp } from "@/app/(auth)/actions";

export default function SignUpPage() {
  return (
    <>
      <h1 className="mt-8 text-3xl font-semibold tracking-tight">
        Create your account
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Start with a private workspace and your own data.
      </p>
      <div className="mt-8">
        <AuthForm action={signUp} mode="sign-up" />
      </div>
    </>
  );
}
