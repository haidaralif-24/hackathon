import { supabase } from "../lib/supabase";

export default function Auth() {
  return (
    <section id="center">
      <h1>Personal Health Companion</h1>
      <p>Sign in to manage your health records</p>
      <button
        type="button"
        className="counter"
        onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })}
      >
        Sign in with Google
      </button>
    </section>
  );
}
