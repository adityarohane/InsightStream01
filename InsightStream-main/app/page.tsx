"use client";
import Image from "next/image";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

export default function Home() {
  const { user } = useUser();

  return (
    <div className="bg-gray-50 dark:bg-neutral-900 min-h-screen">
      {/* Header */}
      <header className="flex flex-wrap sm:justify-start sm:flex-nowrap z-50 w-full bg-white border-b border-gray-200 dark:bg-neutral-800 dark:border-neutral-700 text-sm py-3 sm:py-0">
        <nav
          className="relative p-4 max-w-[85rem] w-full mx-auto sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8"
          aria-label="Global"
        >
          <div className="flex items-center justify-between">
            <div>
              <Image src={"/logo1.png"} alt="InsightStream Logo" width={150} height={150} />
            </div>
          </div>

          <div
            id="navbar-collapse-with-animation"
            className="hs-collapse hidden overflow-hidden transition-all duration-300 basis-full grow sm:block"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end sm:ps-7 cursor-pointer">
              {/* Clerk Authentication */}
              {!user ? (
                <SignInButton mode="modal" signUpForceRedirectUrl={"/dashboard"}>
                  <div className="flex items-center gap-x-2 font-medium text-gray-500 hover:text-blue-600 sm:border-s sm:border-gray-300 py-2 sm:py-0 sm:ms-4 sm:my-6 sm:ps-6 dark:border-neutral-700 dark:text-neutral-400 dark:hover:text-blue-500">
                    <svg
                      className="flex-shrink-0 size-4"
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
                    </svg>
                    Get Started
                  </div>
                </SignInButton>
              ) : (
                <UserButton />
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden before:absolute before:top-0 before:start-1/2 before:bg-[url('https://preline.co/assets/svg/examples/polygon-bg-element.svg')] dark:before:bg-[url('https://preline.co/assets/svg/examples-dark/polygon-bg-element.svg')] before:bg-no-repeat before:bg-top before:bg-cover before:size-full before:-z-[1] before:transform before:-translate-x-1/2">
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-neutral-200">
              Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-tr from-red-500 to-pink-600">InsightStream</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-neutral-400">
              Unlock the power of YouTube analytics. Track, analyze, and grow your channel with data-driven insights.
            </p>

            <div className="mt-8 flex justify-center gap-4">
              <a
                href="/dashboard"
                className="inline-flex items-center gap-3 bg-gradient-to-tr from-red-500 to-pink-600 hover:from-pink-600 hover:to-red-500 text-white font-medium rounded-lg px-6 py-3 shadow-lg transition"
              >
                Get Started
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature Card */}
          {[
            {
              title: "Advanced Analytics",
              desc: "Visualize your channel performance with detailed graphs and reports.",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-white"
                >
                  <path d="M3 3v18h18" />
                  <path d="M9 17v-6h6v6" />
                </svg>
              ),
            },
            {
              title: "Custom Reports",
              desc: "Generate reports tailored to your needs and share with your team.",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-white"
                >
                  <path d="M4 4h16v16H4z" />
                  <path d="M4 9h16" />
                </svg>
              ),
            },
            {
              title: "Real-time Metrics",
              desc: "Stay up-to-date with live data from your YouTube channel.",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-white"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              ),
            },
            {
              title: "24/7 Support",
              desc: "Get assistance whenever you need help with InsightStream.",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-white"
                >
                  <path d="M22 12c0 5-9 10-10 10s-10-5-10-10S7 2 12 2s10 5 10 10z" />
                  <path d="M12 6v6l4 2" />
                </svg>
              ),
            },
          ].map((feature, i) => (
            <a
              key={i}
              href="#"
              className="group flex flex-col justify-center hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-xl p-6 text-center shadow hover:shadow-lg transition"
            >
              <div className="flex justify-center items-center w-16 h-16 bg-red-500 rounded-full mx-auto">
                {feature.icon}
              </div>
              <h3 className="mt-5 text-lg font-semibold text-gray-900 dark:text-white group-hover:text-red-500">
                {feature.title}
              </h3>
              <p className="mt-2 text-gray-600 dark:text-neutral-400">{feature.desc}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
