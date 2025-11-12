import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import AnalyticsStatCard from "../../components/ecommerce/analytics/AnalyticsStatCard";
import CurrentVisitsDonut from "../../components/ecommerce/analytics/CurrentVisitsDonut";
import WebsiteVisitsColumnChart from "../../components/ecommerce/analytics/WebsiteVisitsColumnChart";
import ConversionRatesList from "../../components/ecommerce/analytics/ConversionRatesList";
import SubjectPerformanceRadar from "../../components/ecommerce/analytics/SubjectPerformanceRadar";
import LatestNewsCard from "../../components/ecommerce/analytics/LatestNewsCard";
import OrderTimelineCard from "../../components/ecommerce/analytics/OrderTimelineCard";

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

      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <AnalyticsStatCard key={card.title} {...card} />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <CurrentVisitsDonut className="xl:col-span-5" />
          <WebsiteVisitsColumnChart className="xl:col-span-7" />
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <ConversionRatesList className="xl:col-span-7" />
          <SubjectPerformanceRadar className="xl:col-span-5" />
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <LatestNewsCard className="lg:col-span-7" />
          <OrderTimelineCard className="lg:col-span-5" />
        </section>
      </div>
    </>
  );
}
