import { Link } from "react-router";

const FEATURES = [
  "ATS Score",
  "Keyword Analysis",
  "Rewrite Tips",
  "Tone & Style",
  "Interview Prep",
];

const Footer = () => {
  return (
    <footer className="w-full border-t border-[#e5e5e5] bg-[#f8f7f4] mt-12">
      {/* Feature strip */}
      <div className="border-b border-[#e5e5e5] py-4 px-4 overflow-x-auto">
        <div className="flex items-center justify-center gap-6 sm:gap-10 min-w-max mx-auto">
          {FEATURES.map((f) => (
            <span
              key={f}
              className="text-xs font-semibold text-[#525252] uppercase tracking-widest whitespace-nowrap"
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <p
              className="text-xl font-bold text-[#0a0a0a]"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              ResumeLens
            </p>
            <p className="text-sm text-[#525252] max-w-xs leading-relaxed">
              Actionable feedback to help you land your next role. Score,
              analyze, and improve your resume in seconds.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-[#0a0a0a] uppercase tracking-widest">
              Product
            </p>
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                className="text-sm text-[#525252] hover:text-[#e11d48] transition-colors w-fit"
              >
                My Resumes
              </Link>
              <Link
                to="/upload"
                className="text-sm text-[#525252] hover:text-[#e11d48] transition-colors w-fit"
              >
                Upload Resume
              </Link>
            </div>
          </div>

          {/* Powered by */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-[#0a0a0a] uppercase tracking-widest">
              Built With
            </p>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-[#525252]">
                Claude AI — Anthropic
              </span>
              <span className="text-sm text-[#525252]">Puter Cloud</span>
              <span className="text-sm text-[#525252]">React Router v7</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[#e5e5e5] flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-[#525252]">
            © {new Date().getFullYear()} ResumeLens. All rights reserved.
          </p>
          <p className="text-xs text-[#525252]">
            Your resumes are stored securely via Puter — no third-party sharing.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
