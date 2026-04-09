import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Main() {
  return (
    <div
      className="relative min-h-screen overflow-hidden text-white"
      style={{
        backgroundImage:
          "linear-gradient(rgba(8,125,146,0.82), rgba(8,125,146,0.82)), url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1600&auto=format&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Navbar />
     

      <main className="relative mx-auto flex min-h-[calc(100vh-110px)] max-w-7xl items-center px-8 pb-10 pt-4 md:px-12">
        <div className="grid w-full items-center gap-10 lg:grid-cols-2">
          <section className="z-10 max-w-2xl">
            <h1 className="text-5xl font-bold uppercase leading-[0.95] tracking-wide md:text-7xl xl:text-[86px]">
              <span className="text-[#17d3b1]">Great</span> projects
              <br />
              start with
              <br />
              the right <span className="text-[#17d3b1]">people</span>
            </h1>

            <div className="mt-10 flex flex-wrap gap-5">
              <Link
                to="/login"
                className="min-w-[220px] rounded-2xl bg-[#12cdb4] px-10 py-4 text-center text-2xl font-medium uppercase tracking-wide text-white transition hover:scale-[1.02] hover:bg-[#10b8a2]"
              >
                Log In
              </Link>

              <Link
                to="/register"
                className="min-w-[260px] rounded-2xl bg-[#12cdb4] px-10 py-4 text-center text-2xl font-medium uppercase tracking-wide text-white transition hover:scale-[1.02] hover:bg-[#10b8a2]"
              >
                Register Now
              </Link>
            </div>
          </section>

          <section className="relative hidden min-h-[620px] lg:block">
            <img
              src="/top-character.png"
              alt="Top character"
              className="absolute right-0 top-[-20px] w-[360px] xl:w-[420px]"
            />

            <img
              src="/bottom-character.png"
              alt="Bottom character"
              className="absolute bottom-[-83px] right-[80px] w-[790px] xl:w-[1000px]"
            />
          </section>
        </div>
      </main>
    <Footer />
    </div>
  );
}