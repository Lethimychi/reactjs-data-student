import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import AnalyticsStatCard from "../../analytics/AnalyticsStatCard";
import CurrentVisitsDonut from "../../analytics/CurrentVisitsDonut";
import WebsiteVisitsColumnChart from "../../analytics/WebsiteVisitsColumnChart";
import ConversionRatesList from "../../analytics/ConversionRatesList";
import SubjectPerformanceRadar from "../../analytics/SubjectPerformanceRadar";
import LatestNewsCard from "../../analytics/LatestNewsCard";
import OrderTimelineCard from "../../analytics/OrderTimelineCard";

// charts used elsewhere kept in repo but not shown in this layout

const statCards = [
  {
    title: "Weekly sales",
    value: "714k",
    change: "+2.6%",
    changeLabel: "vs last week",
    trendDirection: "up" as const,
    accentColor: "#5D5FEF",
    backgroundClassName:
      "bg-gradient-to-br from-indigo-500 via-indigo-500/90 to-blue-500 text-white",
    sparklineData: [28, 32, 35, 30, 42, 40, 48, 50],
  },
  {
    title: "New users",
    value: "1.35m",
    change: "-0.1%",
    changeLabel: "vs last month",
    trendDirection: "down" as const,
    accentColor: "#F7936F",
    backgroundClassName:
      "bg-gradient-to-br from-amber-400 via-orange-400/90 to-orange-500 text-white",
    sparklineData: [45, 42, 40, 41, 39, 38, 36, 37],
  },
  {
    title: "Purchase orders",
    value: "1.72m",
    change: "+2.8%",
    changeLabel: "vs last month",
    trendDirection: "up" as const,
    accentColor: "#34D399",
    backgroundClassName:
      "bg-gradient-to-br from-emerald-400 via-emerald-400/90 to-teal-500 text-white",
    sparklineData: [32, 30, 34, 38, 42, 46, 44, 48],
  },
  {
    title: "Messages",
    value: "234",
    change: "+3.6%",
    changeLabel: "vs last day",
    trendDirection: "up" as const,
    accentColor: "#F472B6",
    backgroundClassName:
      "bg-gradient-to-br from-rose-400 via-rose-400/90 to-pink-500 text-white",
    sparklineData: [10, 14, 12, 16, 18, 15, 19, 22],
  },
];

export default function EcommerceAnalytics() {
  return (
    <>
      <PageMeta
        title="Advanced Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="Advanced ecommerce analytics dashboard highlighting KPIs, traffic insights, conversion performance, and order timeline."
      />
      <PageBreadcrumb pageTitle="Ecommerce Analytics" />

      <div className="space-y-6 bg-slate-50 p-6 rounded-lg">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Hi, Welcome back 👋</p>
            <h2 className="text-2xl font-semibold text-slate-700 mt-1">
              Ecommerce & Academic Overview
            </h2>
          </div>
        </div>

        {/* Summary KPI cards (4 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {statCards.map((card) => (
            <div>
              <AnalyticsStatCard {...card} />
            </div>
          ))}
        </div>

        {/* Large charts row: Pie (donut) + Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="h-100">
            <CurrentVisitsDonut className="h-100" />
          </div>

          <div className="h-100">
            <WebsiteVisitsColumnChart className="h-100" />
          </div>
        </div>

        {/* Medium charts row: Horizontal bar + Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="h-130">
            <ConversionRatesList />
          </div>

          <div className="h-130">
            <SubjectPerformanceRadar />
          </div>
        </div>

        {/* Lists, timeline and news */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 rounded-2xl p-6 shadow-md hover:shadow-lg transition">
            <LatestNewsCard />
          </div>
          <div className="lg:col-span-7  rounded-2xl p-6 shadow-md hover:shadow-lg transition">
            <OrderTimelineCard />
          </div>
        </div>

        {/* Bottom: Traffic by site and Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
          <div className="lg:col-span-4 bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition">
            <h3 className="font-semibold text-slate-700 mb-4">
              Traffic by site
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-100 p-4 text-center">
                <div className="text-sm text-slate-500">Facebook</div>
                <div className="mt-2 font-semibold text-slate-700">19.5k</div>
              </div>
              <div className="rounded-lg border border-gray-100 p-4 text-center">
                <div className="text-sm text-slate-500">Google</div>
                <div className="mt-2 font-semibold text-slate-700">91.2k</div>
              </div>
              <div className="rounded-lg border border-gray-100 p-4 text-center">
                <div className="text-sm text-slate-500">LinkedIn</div>
                <div className="mt-2 font-semibold text-slate-700">69.8k</div>
              </div>
              <div className="rounded-lg border border-gray-100 p-4 text-center">
                <div className="text-sm text-slate-500">Twitter</div>
                <div className="mt-2 font-semibold text-slate-700">84.9k</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition">
            <h3 className="font-semibold text-slate-700 mb-4">Tasks</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="form-checkbox" />
                <span className="text-sm text-slate-700">
                  Prepare Monthly Financial Report
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="form-checkbox" />
                <span className="text-sm text-slate-700">
                  Design New Marketing Campaign
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="form-checkbox" />
                <span className="text-sm text-slate-700">
                  Analyze Customer Feedback
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="form-checkbox" />
                <span className="text-sm text-slate-700">
                  Update Website Content
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="form-checkbox" />
                <span className="text-sm text-slate-700">
                  Conduct Market Research
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
