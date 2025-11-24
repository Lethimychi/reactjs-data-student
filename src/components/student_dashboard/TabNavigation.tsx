import React from "react";

interface TabNavigationProps {
  selectedTab: "overview" | "prediction";
  onTabChange: (tab: "overview" | "prediction") => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  selectedTab,
  onTabChange,
}) => {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onTabChange("overview")}
        className={`px-4 py-2 rounded-lg font-semibold transition ${
          selectedTab === "overview"
            ? "bg-white shadow-md"
            : "bg-transparent"
        }`}
      >
        Tổng quan
      </button>
      <button
        onClick={() => onTabChange("prediction")}
        className={`px-4 py-2 rounded-lg font-semibold transition ${
          selectedTab === "prediction"
            ? "bg-white shadow-md"
            : "bg-transparent"
        }`}
      >
        Dự đoán hiệu suất tương lai
      </button>
    </div>
  );
};

export default TabNavigation;
