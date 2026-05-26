import { useCallback } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const TOUR_SEEN_KEY = "rl_tour_seen";

export function useProductTour() {
  const startTour = useCallback(() => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      nextBtnText: "next →",
      prevBtnText: "← prev",
      doneBtnText: "done ✓",
      progressText: "{{current}} / {{total}}",
      popoverClass: "rl-driver-popover",
      steps: [
        {
          popover: {
            title: "welcome to resumelens",
            description:
              "Let's take a quick tour so you know exactly what this tool can do for you.",
            side: "over",
            align: "center",
          },
        },
        {
          element: "#nav-upload-btn",
          popover: {
            title: "upload a resume",
            description:
              "Start here — upload a PDF resume and paste a job description to get AI-powered feedback.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#nav-links",
          popover: {
            title: "navigate the app",
            description:
              "Dashboard shows your past resumes. History tracks score changes over time. Pricing shows plan options.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#resume-grid",
          popover: {
            title: "your resume library",
            description:
              "All your uploaded resumes appear here. Click any card to view the full AI feedback report.",
            side: "top",
            align: "center",
          },
        },
        {
          element: "#compare-btn",
          popover: {
            title: "compare resumes",
            description:
              "Select two resumes to compare them side-by-side — scores, keyword gaps, and section breakdowns.",
            side: "bottom",
            align: "end",
          },
        },
        {
          element: "#stats-strip",
          popover: {
            title: "your stats at a glance",
            description:
              "See how many resumes you've analyzed and your average score across all submissions.",
            side: "bottom",
            align: "center",
          },
        },
      ],
      onDestroyed: () => {
        localStorage.setItem(TOUR_SEEN_KEY, "1");
      },
    });

    driverObj.drive();
  }, []);

  const startTourIfNew = useCallback(() => {
    if (!localStorage.getItem(TOUR_SEEN_KEY)) {
      // slight delay so the page finishes rendering
      setTimeout(() => startTour(), 800);
    }
  }, [startTour]);

  return { startTour, startTourIfNew };
}
