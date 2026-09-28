import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main
      className="page center"
      style={{ padding: 20 }}
    >
      <div
        className="card"
        style={{ width: "min(440px, 100%)" }}
      >
        <div className="brand">
          $SQR RUN
        </div>

        <h1>Login</h1>

        <p className="muted">
          Login with your username and PIN.
        </p>

        <LoginForm />
      </div>
    </main>
  );
}