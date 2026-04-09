import { useNavigate } from "react-router-dom";

export default function Login() {

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // потом тут будет backend login
    // пока просто переходим на profile
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

        <form onSubmit={handleLogin}>

          <label>Email</label>
          <input
            type="email"
            placeholder="Email"
            className="w-full mb-5 mt-2 p-3 rounded-xl bg-transparent border border-teal-400 outline-none"
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Password"
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