import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import AnalyticsStatCard from "../../components/ecommerce/analytics/AnalyticsStatCard";
import CurrentVisitsDonut from "../../components/ecommerce/analytics/CurrentVisitsDonut";
import WebsiteVisitsColumnChart from "../../components/ecommerce/analytics/WebsiteVisitsColumnChart";
import ConversionRatesList from "../../components/ecommerce/analytics/ConversionRatesList";
import LatestNewsCard from "../../components/ecommerce/analytics/LatestNewsCard";
import OrderTimelineCard from "../../components/ecommerce/analytics/OrderTimelineCard";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";

import PassFailRateChart from "../../components/ecommerce/PassFailRateChart";
import HighestLowestScoreChart from "../../components/ecommerce/HighestLowestScoreChart";
import ClassAverageComparisonChart from "../../components/ecommerce/ClassAverageComparisonChart";
import GradeDistributionChart from "../../components/ecommerce/GradeDistributionChart";
import TopFailingSubjectsChart from "../../components/ecommerce/TopFailingSubjectsChart";

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
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <CurrentVisitsDonut className="xl:col-span-5" />
          <WebsiteVisitsColumnChart className="xl:col-span-7" />
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <ConversionRatesList className="xl:col-span-7" />
          <div className="space-y-6">
            {/* Main grid: left area (filters, KPIs, academic charts) and right side MonthlyTarget */}
            <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className=" flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Lớp</label>
                  <select className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
                    <option>CNTT K59</option>
                    <option>CNTT K60</option>
                    <option>Mạng K59</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Semester</label>
                  <select className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
                    <option>HK1 22-23</option>
                    <option>HK2 22-23</option>
                    <option>HK1 23-24</option>
                  </select>
                </div>
              </div>
              <div>
                <div className="lg:col-span-3">
                  {/* Filters */}

                  {/* KPI stat cards */}
                  <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-3">
                    {statCards.map((card) => (
                      <AnalyticsStatCard key={card.title} {...card} />
                    ))}
                  </div>

                  {/* Academic Advisor charts: two rows of three cards, full width of left area */}
                  <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-3">
                    <div className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition">
                      <h3 className="text-lg font-semibold text-slate-700 mb-3 text-center">
                        Pass / Fail Rate
                      </h3>
                      <div className="h-52">
                        <PassFailRateChart className="h-52" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition">
                      <h3 className="text-lg font-semibold text-slate-700 mb-3 text-center">
                        Highest & Lowest Scores
                      </h3>
                      <div className="h-52">
                        <HighestLowestScoreChart className="h-52" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition">
                      <h3 className="text-lg font-semibold text-slate-700 mb-3 text-center">
                        Class Average Comparison
                      </h3>
                      <div className="h-52">
                        <ClassAverageComparisonChart className="h-52" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition">
                      <h3 className="text-lg font-semibold text-slate-700 mb-3 text-center">
                        Grade Distribution (Donut)
                      </h3>
                      <div className="h-52">
                        <GradeDistributionChart className="h-52" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition">
                      <h3 className="text-lg font-semibold text-slate-700 mb-3 text-center">
                        Current Visits
                      </h3>
                      <div className="h-52">
                        <CurrentVisitsDonut className="h-52" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition">
                      <h3 className="text-lg font-semibold text-slate-700 mb-3 text-center">
                        Top Failing Subjects
                      </h3>
                      <div className="h-52">
                        <TopFailingSubjectsChart className="h-52" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column: MonthlyTarget aligned with the left area height */}
                <div className="lg:col-span-1 mt-12">
                  <div className="lg:sticky lg:top-6">
                    <MonthlyTarget />
                  </div>
                </div>
              </div>
            </section>

            {/* Monthly Sales + Statistics (full width) */}
            <section className="grid grid-cols-1 gap-6">
              <div className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition">
                <h3 className="text-lg font-semibold text-slate-700 mb-3 text-center">
                  Monthly Sales
                </h3>
                <WebsiteVisitsColumnChart className="h-72" />
              </div>
            </section>

            <section className="grid grid-cols-1 gap-6 mt-8">
              <div className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition">
                <h3 className="text-lg font-semibold text-slate-700 mb-3 text-center">
                  Statistics
                </h3>
                <ConversionRatesList />
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <LatestNewsCard className="lg:col-span-7" />
              <OrderTimelineCard className="lg:col-span-5" />
            </section>
          </div>
        </section>
      </div>
    </>
  );
}
