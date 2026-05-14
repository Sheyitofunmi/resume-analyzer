import { Link } from "react-router";

const FEATURES = [
  { icon: "🎯", label: "ATS Score" },
  { icon: "🔑", label: "Keyword Analysis" },
  { icon: "✍️", label: "Rewrite Tips" },
  { icon: "💬", label: "Tone & Style" },
  { icon: "🧠", label: "Interview Prep" },
];

const Footer = () => {
  return (
    <footer className="w-full border-t border-gray-100 bg-white mt-12">
      {/* Feature strip */}
      <div className="border-b border-gray-100 py-4 px-4 overflow-x-auto">
        <div className="flex items-center justify-center gap-4 sm:gap-8 min-w-max mx-auto">
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap"
            >
              <span>{f.icon}</span>
              <span className="font-medium">{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <p className="text-xl font-bold text-gradient">RESUMIND</p>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              Smart AI-powered feedback to help you land your dream job. Score,
              analyze, and improve your resume in seconds.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Product
            </p>
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                className="text-sm text-gray-500 hover:text-indigo-600 transition-colors w-fit"
              >
                My Resumes
              </Link>
              <Link
                to="/upload"
                className="text-sm text-gray-500 hover:text-indigo-600 transition-colors w-fit"
              >
                Upload Resume
              </Link>
            </div>
          </div>

          {/* Powered by */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Powered By
            </p>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-gray-500">
                🤖 Claude AI (Anthropic)
              </span>
              <span className="text-sm text-gray-500">☁️ Puter Cloud</span>
              <span className="text-sm text-gray-500">⚡ React Router v7</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} ResumeLens. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">
            Your resumes are stored securely via Puter — no third-party sharing.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
