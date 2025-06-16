import React from "react";
import { FaGithub, FaMicrophone, FaRobot, FaHistory, FaUserShield } from "react-icons/fa";

const Home = () => {
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono flex flex-col">
      {/* Header */}
      <header className="p-6 border-b border-green-600 flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-widest text-green-500">Collab<span className="text-white">AI</span></h1>
        <button className="bg-green-600 hover:bg-green-500 text-black px-4 py-2 rounded-md font-bold transition">
          Sign In
        </button>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-4 py-12">
        <h2 className="text-5xl font-extrabold mb-4 leading-tight">
          Supercharge Your GitHub Workflow with <span className="text-white">AI</span>
        </h2>
        <p className="text-lg text-green-300 max-w-2xl mb-8">
          CollabAI is your all-in-one GitOps companion: Commit history, repo chatbot, and smart meeting transcript summaries — all powered by AI and secured by Clerk.
        </p>
        <input
          type="text"
          placeholder="Enter your GitHub Personal Access Token"
          className="w-full max-w-lg p-3 rounded-lg bg-zinc-900 text-green-300 border border-green-600 mb-6 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <div className="flex flex-wrap justify-center gap-4">
          <button className="bg-green-500 text-black px-6 py-3 rounded-lg text-lg font-semibold hover:bg-green-400 transition">
            Get Started
          </button>
          <button className="border border-green-400 text-green-400 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-green-800 transition">
            Learn More
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-zinc-950">
        <h3 className="text-3xl font-bold text-center mb-10 text-green-400">What You Can Do</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="bg-black border border-green-600 p-6 rounded-xl shadow-lg hover:shadow-green-500/30 transition">
            <FaHistory className="text-4xl mb-4 text-green-500" />
            <h4 className="text-xl font-semibold mb-2">View Commit History</h4>
            <p className="text-green-300">
              Instantly fetch and view your repository’s commit logs with smart filters and context.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-black border border-green-600 p-6 rounded-xl shadow-lg hover:shadow-green-500/30 transition">
            <FaRobot className="text-4xl mb-4 text-green-500" />
            <h4 className="text-xl font-semibold mb-2">AI Git Assistant</h4>
            <p className="text-green-300">
              Chat with your codebase! Ask repository-specific questions powered by Gemini AI.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-black border border-green-600 p-6 rounded-xl shadow-lg hover:shadow-green-500/30 transition">
            <FaMicrophone className="text-4xl mb-4 text-green-500" />
            <h4 className="text-xl font-semibold mb-2">Audio/Video Transcription</h4>
            <p className="text-green-300">
              Upload your team meetings or voice notes. We’ll transcribe them using AssemblyAI.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-black border border-green-600 p-6 rounded-xl shadow-lg hover:shadow-green-500/30 transition">
            <FaRobot className="text-4xl mb-4 text-green-500" />
            <h4 className="text-xl font-semibold mb-2">AI Meeting Summary</h4>
            <p className="text-green-300">
              Let Gemini analyze your transcript and deliver clean, actionable summaries.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-black border border-green-600 p-6 rounded-xl shadow-lg hover:shadow-green-500/30 transition">
            <FaGithub className="text-4xl mb-4 text-green-500" />
            <h4 className="text-xl font-semibold mb-2">GitHub Connected</h4>
            <p className="text-green-300">
              Just plug in your GitHub token and let CollabAI handle the rest. No setup, no hassle.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-black border border-green-600 p-6 rounded-xl shadow-lg hover:shadow-green-500/30 transition">
            <FaUserShield className="text-4xl mb-4 text-green-500" />
            <h4 className="text-xl font-semibold mb-2">Secured with Clerk</h4>
            <p className="text-green-300">
              All user auth and session security is handled via Clerk. Your data stays safe.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="p-6 text-center border-t border-green-600 text-green-500 text-sm bg-zinc-950">
        © 2025 CollabAI — Built with ❤️ by Developers, for Developers.
      </footer>
    </div>
  );
};

export default Home;
