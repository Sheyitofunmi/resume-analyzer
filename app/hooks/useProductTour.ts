import { useCallback } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const TOUR_SEEN_KEY = "rl_tour_seen";

export function useProductTour() {
  const startTour = useCallback(() => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      nextBtnText: "Next →",
      prevBtnText: "← Back",
      doneBtnText: "Done ✓",
      progressText: "{{current}} / {{total}}",
      popoverClass: "rl-driver-popover",
      steps: [
        {
          popover: {
            title: "Welcome to ResumeLens",
            description:
              "Let's take a quick tour so you know exactly what this tool can do for you.",
            side: "over",
            align: "center",
          },
        },
        {
          element: "#nav-upload-btn",
          popover: {
            title: "Your plan",
            description:
              "You're on the free plan — tap here anytime to see what upgrading unlocks.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#nav-links",
          popover: {
            title: "Get around the app",
            description:
              "Home shows your resumes. Upload starts a new scan. History tracks score changes over time.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#resume-grid",
          popover: {
            title: "Your resume library",
            description:
              "All your uploaded resumes live here. Click any card to open its full AI feedback report.",
            side: "top",
            align: "center",
          },
        },
        {
          element: "#compare-btn",
          popover: {
            title: "Compare resumes",
            description:
              "Select two resumes to compare them side-by-side — scores, keyword gaps, and section breakdowns.",
            side: "bottom",
            align: "end",
          },
        },
        {
          element: "#stats-strip",
          popover: {
            title: "Your stats at a glance",
            description:
              "See how many dimensions we score and how fast the analysis runs.",
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
