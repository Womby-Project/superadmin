import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(""); // 👈 username instead of email
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      // 1️⃣ Get email from admin_users by username
      const { data: userRecord, error: fetchError } = await supabase
        .from("admin_users")
        .select("email")
        .eq("username", username)
        .single();

      if (fetchError || !userRecord) {
        throw new Error("Invalid username or password");
      }

      // 2️⃣ Login using email + password with Supabase Auth
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: userRecord.email,
        password,
      });

      if (loginError) throw new Error("Invalid username or password");

      // 3️⃣ Redirect
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center w-screen px-4 h-17 shadow-sm border border-[#E5E7EB] bg-[#FFFFFF] gap-2">
        <img
          src="/mainlogo.png"
          alt="mainlogo"
          className="w-[40px] h-[40px] bg-[#FCF5EE] rounded-lg"
        />
        <p className="font-bold text-[18px] text-[#E46B64]">Wombly</p>
      </div>

      {/* Main content */}
      <main className="flex flex-1 items-center justify-center bg-[#FFFFFF] border border-[#E5E7EB] shadow-md">
        <div className="w-[468px] h-[480px] p-6 bg-[#FFFFFF] border border-[#E5E7EB] shadow-lg rounded-lg px-10">
          <form onSubmit={handleLogin} className="flex flex-col">
            <h1 className="text-[40px] font-bold text-[#E46B64] font-lato">Welcome back</h1>
            <p className="text-[17px] text-[#616161]">Enter your credentials.</p>

            {/* Username */}
            <div className="flex flex-col mt-5">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-sm w-[362px] h-[45px] px-4"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col mt-5">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-sm w-[362px] h-[45px] px-4"
              />
            </div>

            {/* Error message */}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="bg-[#E46B64] border border-[#E46B64] w-[362px] h-[45px] rounded-md mt-6 text-[#FFFFFF] hover:shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* Sign up */}
            <div className="flex flex-1 items-center justify-center gap-1 font-semibold mt-7">
              <h1 className="text-[#616161] text-[15px]">Don't have an account?</h1>
              <button
                type="button"
                className="text-[15px] text-[#E46B64] hover:text-gray-800 cursor-pointer"
                onClick={() => navigate("/registration")}
              >
                Sign up
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
