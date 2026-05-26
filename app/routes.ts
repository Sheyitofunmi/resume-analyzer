import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/landing", "routes/landing.tsx"),
  route("/auth", "routes/auth.tsx"),
  route("/onboarding", "routes/onboarding.tsx"),
  route("/upload", "routes/upload.tsx"),
  route("/resume/:id", "routes/resume.tsx"),
  route("/history", "routes/history.tsx"),
  route("/settings", "routes/settings.tsx"),
  route("/pricing", "routes/pricing.tsx"),
  route("/wipe", "routes/wipe.tsx"),
] satisfies RouteConfig;
