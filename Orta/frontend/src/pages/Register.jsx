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
      await registerUser({
        username: nickname,
        email,
        password,
        full_name: full_name || null,
      });

      navigate("/login");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0e7397]">
      <div className="mx-auto flex min-h-screen max-w-[1500px] items-center justify-center gap-8 px-4 py-8 sm:px-6 md:px-10 lg:justify-between">
        <div className="hidden items-end justify-center overflow-hidden lg:flex lg:w-1/2">
          <img
            src="/register-character.png"
            alt="register character"
            className="max-h-[76vh] w-auto object-contain -translate-x-15 translate-y-2"
          />
        </div>

        <div className="flex w-full justify-center lg:w-1/2">
          <div className="w-full max-w-[700px] rounded-[30px] bg-[#18b8ab] px-6 py-8 text-white shadow-[0_10px_40px_rgba(0,0,0,0.18)] sm:px-8 sm:py-10 md:px-12">
            <h1 className="text-center text-3xl font-medium uppercase leading-[1.08] tracking-[0.08em] sm:text-5xl md:text-6xl">
              Create an <span className="font-extrabold">Orta</span>
              <br />
              account
            </h1>

            <p className="mt-5 text-center text-sm text-white/90 md:text-base">
              Fill in your personal details to access teams and lobbies
            </p>

            <form onSubmit={handleRegister} className="mt-8 sm:mt-10">
              <div>
                <label className="mb-2 block text-lg font-medium">Email</label>
                <input
                  type="email"
                  placeholder="230107142@sdu.edu.kz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-[56px] w-full rounded-[14px] border-2 border-[#0d6789] bg-transparent px-5 text-base text-white placeholder:text-white/45 outline-none"
                />
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-lg font-medium">Name</label>
                  <input
                    type="text"
                    placeholder="Rakhat"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-[56px] w-full rounded-[14px] border-2 border-[#0d6789] bg-transparent px-5 text-base text-white placeholder:text-white/45 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-lg font-medium">
                    Surname
                  </label>
                  <input
                    type="text"
                    placeholder="Bitimbay"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    className="h-[56px] w-full rounded-[14px] border-2 border-[#0d6789] bg-transparent px-5 text-base text-white placeholder:text-white/45 outline-none"
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-lg font-medium">
                    Nickname
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="h-[56px] w-full rounded-[14px] border-2 border-[#0d6789] bg-transparent px-5 text-base text-white placeholder:text-white/45 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-lg font-medium">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-[56px] w-full rounded-[14px] border-2 border-[#0d6789] bg-transparent px-5 text-base text-white placeholder:text-white/45 outline-none"
                  />
                </div>
              </div>

              {errorMessage && (
                <p className="mt-4 text-sm text-red-200">{errorMessage}</p>
              )}

              <button
                type="submit"
                className="mt-7 h-[58px] w-full rounded-[14px] bg-[#0d6789] text-xl font-semibold text-white transition hover:bg-[#0b5c7a]"
              >
                Register
              </button>

              <p className="mt-6 text-center text-base text-white/90">
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
