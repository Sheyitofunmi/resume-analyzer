import { Link, useLocation } from "react-router";

const SLOTS = [
  { label: "home", icon: "⌂", to: "/" },
  { label: "upload", icon: "↑", to: "/upload" },
  { label: "history", icon: "◈", to: "/history" },
  { label: "pricing", icon: "$", to: "/pricing" },
  { label: "settings", icon: "⚙", to: "/settings" },
];

const MobileBottomNav = () => {
  const location = useLocation();

  return (
    <nav className="rl-bottom-nav">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "0 8px",
        }}
      >
        {SLOTS.map((slot) => {
          const active =
            slot.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(slot.to);
          return (
            <Link
              key={slot.to}
              to={slot.to}
              className={`rl-bottom-nav-link${active ? " is-active" : ""}`}
              style={{
                color: active ? "var(--phos)" : "var(--fg-3)",
                filter: active ? "drop-shadow(0 0 6px var(--phos))" : "none",
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>{slot.icon}</span>
              <span>{slot.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
