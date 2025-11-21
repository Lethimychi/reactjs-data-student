module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3B82F6",
          dark: "#1E40AF",
          light: "#93C5FD",
        },
        accent: "#60A5FA",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        background: "#F8FAFC",
        border: "#E2E8F0",
        "text-primary": "#1E293B",
        "text-secondary": "#64748B",
        // Support old naming conventions as well
        "bg-primary": "#F8FAFC",
        "border-primary": "#E2E8F0",
      },
    },
  },
  plugins: [],
};
