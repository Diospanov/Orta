import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginUser } from "../api";

  export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await loginUser(email, password);
      localStorage.setItem("token", data.access_token);
      console.log("Login success:", data);
    } catch (error) {
      console.error("Login error:", error.message);
    }
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-[#18a999] flex items-center justify-center relative overflow-hidden">

      <div className="bg-[#0f5f78] p-10 rounded-3xl w-[420px] text-white shadow-xl">

        <h1 className="text-4xl font-bold mb-2 text-center">
          Welcome back
        </h1>

        <p className="text-center mb-8 opacity-80">
          Please enter your details
        </p>

        <form onSubmit={handleSubmit}>

          <label>Email</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-5 mt-2 p-3 rounded-xl bg-transparent border border-teal-400 outline-none"
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-3 mt-2 p-3 rounded-xl bg-transparent border border-teal-400 outline-none"
          />

          <p className="text-sm mb-6 opacity-70">
            Forgot your password?
          </p>

          <button
            type="submit"
            className="w-full bg-[#19c1a7] py-3 rounded-xl text-lg font-semibold hover:bg-[#15a892]"
          >
            Log in
          </button>

        </form>

        <p className="text-center mt-6 text-sm opacity-80">
          Don’t have an account? Create one
        </p>

      </div>

      <img
        src="/leaf-character.png"
        className="absolute right-10 bottom-0 w-[350px]"
      />

    </div>
  );
}