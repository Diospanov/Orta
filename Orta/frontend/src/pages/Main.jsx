import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/useAuth";

export default function Main() {
  const { isAuthenticated } = useAuth();

  const heroLines = [
    {
      className: "text-[40px] whitespace-nowrap md:text-[58px] xl:text-[68px]",
      parts: [
        { text: "Great\u00A0", accent: true },
        { text: "projects" },
      ],
    },
    {
      className: "text-[40px] md:text-[58px] xl:text-[68px]",
      parts: [{ text: "start with" }],
    },
    {
      className: "text-[34px] whitespace-nowrap md:text-[58px] xl:text-[68px]",
      parts: [
        { text: "the right\u00A0" },
        { text: "people", accent: true },
      ],
    },
  ];

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
      <div className="relative z-20">
        <Navbar />
      </div>

      <main className="relative mx-auto flex min-h-[calc(100vh-130px)] max-w-7xl items-center px-4 pb-10 pt-4 sm:px-6 md:px-12 lg:min-h-[calc(100vh-110px)]">
        <div className="grid w-full items-center gap-10 lg:grid-cols-2">
          <section className="z-10 max-w-[760px]">
            <h1 className="font-normal uppercase leading-[0.84] tracking-[0.035em] text-white">
              {heroLines.map(({ className, parts }) => (
                <span
                  key={parts.map(({ text }) => text).join("")}
                  className={`block ${className}`}
                >
                  {parts.map(({ text, accent }) => (
                    <span
                      key={text}
                      className={accent ? "text-[#17d3b1]" : undefined}
                    >
                      {text}
                    </span>
                  ))}
                </span>
              ))}
            </h1>

            <div
              className={`flex flex-wrap gap-5 ${
                isAuthenticated ? "mt-0 justify-center" : "mt-8 md:mt-10"
              }`}
            >
              {isAuthenticated ? (
                <Link
                  to="/browse-teams"
                  className="w-full rounded-[24px] bg-[#12cdb4] px-8 py-4 text-center text-[20px] font-normal uppercase tracking-[0.05em] text-white transition hover:scale-[1.02] hover:bg-[#10b8a2] sm:w-auto sm:min-w-[240px] md:min-w-[300px] md:text-[22px]"
                >
                  Start
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full rounded-[24px] bg-[#12cdb4] px-8 py-4 text-center text-[20px] font-normal uppercase tracking-[0.05em] text-white transition hover:scale-[1.02] hover:bg-[#10b8a2] sm:w-auto sm:min-w-[220px] md:min-w-[240px] md:text-[22px]"
                  >
                    Log In
                  </Link>

                  <Link
                    to="/register"
                    className="w-full rounded-[24px] bg-[#12cdb4] px-8 py-4 text-center text-[20px] font-normal uppercase tracking-[0.05em] text-white transition hover:scale-[1.02] hover:bg-[#10b8a2] sm:w-auto sm:min-w-[240px] md:min-w-[300px] md:text-[22px]"
                  >
                    Register Now
                  </Link>
                </>
              )}
            </div>
          </section>

          <section className="relative hidden min-h-[620px] lg:block">
            <img
              src="/top-character.svg"
              alt="Top character"
              className="pointer-events-none absolute -right-[180px] -top-[1px] z-10 w-[580px] max-w-none origin-center rotate-[1deg] xl:-right-[438px] xl:-top-[280px] xl:w-[780px]"
            />

            <img
              src="/bottom-character.svg"
              alt="Bottom character"
              className="pointer-events-none absolute right-[-140px] top-[300px] z-0 w-[790px] max-w-none xl:right-[0px] xl:top-[150px] xl:w-[700px]"
            />
          </section>
        </div>
      </main>
      <div className="relative z-20">
        <Footer />
      </div>
    </div>
  );
}
