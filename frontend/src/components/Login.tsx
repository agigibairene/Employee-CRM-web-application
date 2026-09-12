import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useLoginMutation } from "../redux/authApi";
import { selectIsAuthenticated, setCredentials } from "../redux/authSlice";
import { FormField } from "../ui/FormField";
import { Button } from "../ui/Button";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../redux/store";

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  function validate(): boolean {
    const errors: FieldErrors = {};
    if (!email) errors.email = "Enter your work email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Enter your password.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    try {
      const tokens = await login({ email, password }).unwrap();
      dispatch(setCredentials(tokens));
      navigate("/dashboard");
    } catch (err: unknown) {
      const errorData = (err as { data?: { detail?: string; non_field_errors?: string[] } })?.data;
      const message =
        errorData?.detail ||
        errorData?.non_field_errors?.[0] ||
        "Unable to sign in. Please try again.";
      setFormError(message);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-100">
        <div className="mb-8 text-center">
          <h1 className="font-serif-brand text-2xl font-semibold text-ink">Personnel</h1>
          <div className="mx-auto mt-3 h-px w-10 bg-accent" />
          <p className="mt-3 text-sm text-ink-muted">Sign in with your company email.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-sm border border-border bg-white p-6"
        >
          {formError && (
            <div className="mb-4 rounded-sm bg-danger-bg px-3 py-2 text-sm text-danger" role="alert">
              {formError}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <FormField label="Email" htmlFor="email" error={fieldErrors.email}>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="rounded-sm border border-border px-3 py-2 text-sm outline-none focus:border-(--primary)"
              />
            </FormField>

            <FormField label="Password" htmlFor="password" error={fieldErrors.password}>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-sm border border-border px-3 py-2 text-sm outline-none focus:border-(--primary)"
              />
            </FormField>

            <Button type="submit" isLoading={isLoading} className="mt-2">
              Sign in
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-ink-muted">
          Accounts are created by HR. Check your inbox for an activation link if you're new.
        </p>
      </div>
    </main>
  );
}