import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAcceptInviteMutation } from "../redux/authApi";
import { FormField } from "../ui/FormField";
import { Button } from "../ui/Button";

function ActivateForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [acceptInvite, { isLoading }] = useAcceptInviteMutation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirm?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  if (!token) {
    return (
      <div className="rounded-sm border border-border bg-white p-6 text-center">
        <p className="text-sm text-danger">
          This activation link is missing its token. Use the link from your invite email.
        </p>
      </div>
    );
  }

  function validate(): boolean {
    const errors: { password?: string; confirm?: string } = {};
    if (password.length < 8) errors.password = "Use at least 8 characters.";
    if (confirmPassword !== password) errors.confirm = "Passwords don't match.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!token) return;
    if (!validate()) return;

    try {
      await acceptInvite({ token, password }).unwrap();
      setIsDone(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: unknown) {
      const errorData = (err as { data?: { detail?: string } })?.data;
      setFormError(errorData?.detail || "Unable to activate your account. Please try again.");
    }
  }

  if (isDone) {
    return (
      <div className="rounded-sm border border-border bg-white p-6 text-center">
        <p className="text-sm text-(--ink)">Account activated. Taking you to sign in…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-sm border border-border bg-white p-6">
      {formError && (
        <div className="mb-4 rounded-sm bg-danger-bg px-3 py-2 text-sm text-danger" role="alert">
          {formError}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <FormField label="New password" htmlFor="password" error={fieldErrors.password}>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-sm border border-border px-3 py-2 text-sm outline-none focus:border-(--primary)"
          />
        </FormField>

        <FormField label="Confirm password" htmlFor="confirm" error={fieldErrors.confirm}>
          <input
            id="confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="rounded-sm border border-border px-3 py-2 text-sm outline-none focus:border-(--primary)"
          />
        </FormField>

        <Button type="submit" isLoading={isLoading} className="mt-2">
          Set password
        </Button>
      </div>
    </form>
  );
}

export default function ActivatePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-100">
        <div className="mb-8 text-center">
          <h1 className="font-serif-brand text-2xl font-semibold text-(--ink)">Activate your account</h1>
          <div className="mx-auto mt-3 h-px w-10 bg-accent" />
          <p className="mt-3 text-sm text-(--ink-muted)">Choose a password to finish setting up.</p>
        </div>
        <ActivateForm />
      </div>
    </main>
  );
}