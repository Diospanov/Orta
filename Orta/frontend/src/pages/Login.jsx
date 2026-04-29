import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { loginUser } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const data = await loginUser(email, password);
      localStorage.setItem("token", data.access_token);
      await login();
      navigate("/profile");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#18b3a6]">
      <div className="mx-auto flex min-h-screen max-w-[1500px] items-center justify-center gap-8 px-4 py-8 sm:px-6 md:px-10 lg:justify-between">
        <div className="flex w-full items-center justify-center lg:w-1/2">
          <div className="w-full max-w-[620px] rounded-[30px] bg-[#0f6784] px-6 py-8 text-white shadow-[0_10px_40px_rgba(0,0,0,0.18)] sm:px-10 sm:py-10 md:px-14 md:py-12">
            <h1 className="text-center text-3xl font-medium uppercase leading-[1.08] tracking-[0.08em] sm:text-5xl md:text-6xl">
              Welcome back
              <br />
              to <span className="font-extrabold">Orta</span>
            </h1>

            <p className="mt-5 text-center text-sm text-white/90 md:text-base">
              Welcome back! Please enter your details
            </p>

            <form onSubmit={handleSubmit} className="mt-8 sm:mt-10">
              <div>
                <label className="mb-2 block text-lg font-medium">Email</label>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-[56px] w-full rounded-[14px] border-2 border-[#11bfd3] bg-transparent px-4 text-base text-white placeholder:text-white/45 outline-none"
                />
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-lg font-medium">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-[56px] w-full rounded-[14px] border-2 border-[#11bfd3] bg-transparent px-4 text-base text-white placeholder:text-white/45 outline-none"
                />
              </div>

              <p className="mt-5 text-right text-base font-medium text-white/95">
                Forgot your password?
              </p>

              {errorMessage && (
                <p className="mt-4 text-sm text-red-200">{errorMessage}</p>
              )}

              <button
                type="submit"
                className="mt-6 h-[58px] w-full rounded-[14px] bg-[#19c7b2] text-xl font-semibold text-white transition hover:bg-[#16b39f]"
              >
                Log in
              </button>

              <p className="mt-6 text-center text-base text-white/85">
                Don’t have an account?{" "}
                <Link to="/register" className="font-semibold text-white">
                  Create one
                </Link>
              </p>
            </form>
          </div>
        </div>

        <div className="hidden items-end justify-center overflow-hidden lg:flex lg:w-1/2">
          <img
            src="/leaf-character.png"
            alt="leaf character"
            className="max-h-[76vh] w-auto object-contain translate-x-15 translate-y-2"
          />
        </div>
      </div>
    </div>
  );
}
