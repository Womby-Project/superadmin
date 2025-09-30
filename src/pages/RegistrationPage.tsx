import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export default function SignUpPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [userName, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ✅ Password validation rules
    const passwordValidations = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        match: password === confirmPassword && confirmPassword.length > 0,
    };

    const isFormValid =
        passwordValidations.length &&
        passwordValidations.uppercase &&
        passwordValidations.specialChar &&
        passwordValidations.match &&
        userName &&
        email;

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isFormValid) return;

        try {
            setLoading(true);
            setError(null);

            // 1️⃣ Create Auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error("No user returned from Supabase.");

            // 2️⃣ Insert into admin_users with default Admin role
            const { error: insertError } = await supabase.from("admin_users").insert([
                {
                    id: authData.user.id,
                    username: userName,
                    email: email,
                    role_id: "960758e5-2305-40d1-9dae-240b2be0d22f",
                },
            ]);

            if (insertError) throw insertError;

            // 3️⃣ Redirect
            navigate("/");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to sign up. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen">
            {/* Header */}
            <div className="flex items-center w-screen px-4 h-17 shadow-sm border border-[#E5E7EB] bg-[#FFFFFF] gap-2">
                <img
                    src="/src/assets/wombly-logo.png"
                    alt="womblylogo"
                    className="w-[40px] h-[40px] bg-[#FCF5EE] rounded-lg"
                />
                <p className="font-bold text-[18px] text-[#E46B64]">Wombly</p>
            </div>

            {/* Main content */}
            <main className="flex flex-1 items-center justify-center bg-[#FFFFFF] border border-[#E5E7EB] shadow-md">
                <div className="w-[468px] min-h-[560px] p-6 bg-[#FFFFFF] border border-[#E5E7EB] shadow-lg rounded-lg px-10">
                    <form onSubmit={handleSignUp} className="flex flex-col">
                        <h1 className="text-[36px] font-bold text-[#E46B64] font-lato">Create an account</h1>
                        <p className="text-[16px] text-[#616161]">Fill in your details to get started.</p>

                        { /* Username */}
                        <div className="flex flex-col mt-5">
                            <input
                                type="text"
                                placeholder="Username"
                                value={userName}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-sm w-[362px] h-[45px] px-4"
                            />
                        </div>



                        {/* Email */}
                        <div className="flex flex-col mt-4">
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-sm w-[362px] h-[45px] px-4 focus:outline-none focus:ring-2 focus:ring-[#E46B64]"
                            />
                        </div>

                        {/* Password */}
                        <div className="flex flex-col mt-4">
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-sm w-[362px] h-[45px] px-4 focus:outline-none focus:ring-2 focus:ring-[#E46B64]"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div className="flex flex-col mt-4">
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-sm w-[362px] h-[45px] px-4 focus:outline-none focus:ring-2 focus:ring-[#E46B64]"
                            />
                        </div>

                        {/* ✅ Show password requirements only when typing */}
                        {(password.length > 0 || confirmPassword.length > 0) && (
                            <div className="mt-3 text-sm text-gray-700">
                                <p className={passwordValidations.length ? "text-green-600" : "text-red-500"}>
                                    {passwordValidations.length ? "✔" : "✘"} At least 8 characters
                                </p>
                                <p className={passwordValidations.uppercase ? "text-green-600" : "text-red-500"}>
                                    {passwordValidations.uppercase ? "✔" : "✘"} At least 1 uppercase letter
                                </p>
                                <p className={passwordValidations.specialChar ? "text-green-600" : "text-red-500"}>
                                    {passwordValidations.specialChar ? "✔" : "✘"} At least 1 special character
                                </p>
                                <p className={passwordValidations.match ? "text-green-600" : "text-red-500"}>
                                    {passwordValidations.match ? "✔" : "✘"} Passwords match
                                </p>
                            </div>
                        )}


                        {/* Error */}
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={!isFormValid || loading}
                            className="bg-[#E46B64] border border-[#E46B64] w-[362px] h-[45px] rounded-md mt-6 text-[#FFFFFF] font-semibold hover:shadow-md cursor-pointer disabled:opacity-50 transition duration-200"
                        >
                            {loading ? "Creating account..." : "Sign Up"}
                        </button>

                        {/* Already have account */}
                        <div className="flex flex-1 items-center justify-center gap-1 font-semibold mt-7">
                            <h1 className="text-[#616161] text-[15px]">Already have an account?</h1>
                            <button
                                type="button"
                                className="text-[15px] text-[#E46B64] hover:text-gray-800 cursor-pointer"
                                onClick={() => navigate("/")}
                            >
                                Login
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
