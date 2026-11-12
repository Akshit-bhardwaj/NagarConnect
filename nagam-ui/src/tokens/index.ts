export const tokens = {
  colors: {
    brand: {
      navy: "#142F58",
      blue: "#245A86",
      white: "#FFFFFF",
      lightBlue: "#EAF1F6",
      accent: "#D97706",
    },
    civic: {
      success: "#059669",
      warning: "#D97706",
      danger: "#DC2626",
      info: "#2563EB",
      slate: "#475569",
    },
    status: {
      SUBMITTED: { bg: "#FEF3C7", text: "#92400E", label: "Submitted" },
      TRIAGED: { bg: "#EDE9FE", text: "#5B21B6", label: "Triaged" },
      ASSIGNED: { bg: "#DBEAFE", text: "#1E40AF", label: "Assigned" },
      IN_PROGRESS: { bg: "#E0E7FF", text: "#3730A3", label: "In Progress" },
      NEEDS_INFORMATION: { bg: "#FFEDD5", text: "#9A3412", label: "Action Needed" },
      RESOLVED: { bg: "#D1FAE5", text: "#065F46", label: "Resolved" },
      CLOSED: { bg: "#F1F5F9", text: "#334155", label: "Closed" },
      REOPENED: { bg: "#FEE2E2", text: "#991B1B", label: "Reopened" },
      REJECTED: { bg: "#FEE2E2", text: "#991B1B", label: "Rejected" },
    },
  },
  typography: {
    fontSans: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
};

export type StatusKey = keyof typeof tokens.colors.status;
