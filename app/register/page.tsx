import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
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

        <h1>Create account</h1>

        <p className="muted">
          Create your username, add your EVM wallet
          and choose your PIN.
        </p>

        <RegisterForm />
      </div>
    </main>
  );
}