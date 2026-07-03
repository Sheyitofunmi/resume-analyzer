import { Link, useLocation } from "react-router";
import { motion, useReducedMotion } from "framer-motion";
import { springs } from "~/lib/motion";
import { Home, Upload, History, Tag, Settings } from "lucide-react";

const SLOTS = [
  { label: "Home", Icon: Home, to: "/" },
  { label: "Upload", Icon: Upload, to: "/upload" },
  { label: "History", Icon: History, to: "/history" },
  { label: "Pricing", Icon: Tag, to: "/pricing" },
  { label: "Settings", Icon: Settings, to: "/settings" },
];

const MobileBottomNav = () => {
  const location = useLocation();
  const reduced = useReducedMotion();

  return (
    <nav className="rl-bottom-nav" aria-label="Primary">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "0 8px",
        }}
      >
        {SLOTS.map(({ label, Icon, to }) => {
          const active =
            to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? "page" : undefined}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                padding: "10px 10px 12px",
                textDecoration: "none",
                color: "var(--ink)",
                fontSize: 10,
                fontWeight: 800,
                zIndex: 0,
              }}
            >
              {active && (
                <motion.span
                  layoutId="mobile-nav-active"
                  style={{
                    position: "absolute",
                    inset: "6px 2px 8px",
                    borderRadius: 10,
                    background: "var(--cyan)",
                    border: "var(--bw) solid var(--ink)",
                    zIndex: -1,
                  }}
                  transition={reduced ? { duration: 0 } : springs.smooth}
                />
              )}
              <Icon size={17} strokeWidth={2.4} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
