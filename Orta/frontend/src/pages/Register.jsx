import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { registerUser } from "../api";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const full_name = `${name} ${surname}`.trim();

    try {
      const data = await registerUser({
        username: nickname,
        email,
        password,
        full_name: full_name || null,
      });

      console.log("Register success:", data);
      navigate("/login");
    } catch (error) {
      console.error("Register error:", error.message);
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0e6f92]">
      <div className="mx-auto flex min-h-screen max-w-[1500px] items-center justify-between px-6 py-8 md:px-10">
        <div className="hidden w-[42%] items-end justify-start lg:flex">
          <img
            src="/register-character.png"
            alt="register character"
            className="max-h-[88vh] w-auto object-contain"
          />
        </div>

        <div className="flex w-full justify-center lg:w-[58%]">
          <div className="w-full max-w-[900px] rounded-[34px] bg-[#10b5a6] px-8 py-10 text-white shadow-[0_10px_40px_rgba(0,0,0,0.18)] md:px-12 md:py-12">
            <h1 className="text-center text-5xl font-medium uppercase leading-[1.05] tracking-[0.08em] md:text-7xl">
              Create an <span className="font-extrabold">Orta</span>
              <br />
              account
            </h1>

            <p className="mt-6 text-center text-lg text-white/90 md:text-2xl">
              Fill in your personal details to access teams and lobbies
            </p>

            <form onSubmit={handleRegister} className="mt-10">
              <div>
                <label className="mb-3 block text-2xl font-medium">Email</label>
                <input
                  type="email"
                  placeholder="230107142@sdu.edu.kz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-[78px] w-full rounded-[22px] border-[4px] border-[#0d6789] bg-transparent px-6 text-2xl text-white placeholder:text-white/45 outline-none"
                />
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-3 block text-2xl font-medium">Name</label>
                  <input
                    type="text"
                    placeholder="Rakhat"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-[78px] w-full rounded-[22px] border-[4px] border-[#0d6789] bg-transparent px-6 text-2xl text-white placeholder:text-white/45 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-3 block text-2xl font-medium">Surname</label>
                  <input
                    type="text"
                    placeholder="Bitimbay"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    className="h-[78px] w-full rounded-[22px] border-[4px] border-[#0d6789] bg-transparent px-6 text-2xl text-white placeholder:text-white/45 outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-3 block text-2xl font-medium">Nickname</label>
                  <input
                    type="text"
                    placeholder="Enter your nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="h-[78px] w-full rounded-[22px] border-[4px] border-[#0d6789] bg-transparent px-6 text-2xl text-white placeholder:text-white/45 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-3 block text-2xl font-medium">Password</label>
                  <input
                    type="password"
                    placeholder="Enter a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-[78px] w-full rounded-[22px] border-[4px] border-[#0d6789] bg-transparent px-6 text-2xl text-white placeholder:text-white/45 outline-none"
                  />
                </div>
              </div>

              {errorMessage && (
                <p className="mt-4 text-lg text-red-200">{errorMessage}</p>
              )}

              <button
                type="submit"
                className="mt-10 h-[84px] w-full rounded-[22px] bg-[#0d6789] text-3xl font-medium text-white transition hover:bg-[#0b5c7a]"
              >
                Register
              </button>

              <p className="mt-8 text-center text-2xl text-white/90">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-white">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}