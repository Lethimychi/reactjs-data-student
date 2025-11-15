import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import { useState } from "react";

export default function Home() {
  const classList = [
    {
      id: 1,
      name: "CNTT K59",
      instructor: "Nguyễn A",
      students: 28,
      avgGPA: 3.42,
    },
    {
      id: 2,
      name: "CNTT K60",
      instructor: "Trần B",
      students: 32,
      avgGPA: 3.21,
    },
    { id: 3, name: "Mạng K59", instructor: "Lê C", students: 25, avgGPA: 3.1 },
    {
      id: 4,
      name: "An toàn K59",
      instructor: "Phạm D",
      students: 22,
      avgGPA: 3.05,
    },
  ];
    const shorten = (s: string, max = 12) =>
      s && s.length > max ? s.slice(0, max) + "…" : s;
    const [selectedClassId, setSelectedClassId] = useState<number>(
      classList[0]?.id ?? 0
    );
  
  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
  <div className="flex flex-wrap items-center gap-3 mb-6">
  <div className="flex items-center space-x-2">
    <label htmlFor="filter-class" className="text-sm text-gray-600">
      Lớp
    </label>
    <select
      id="filter-class"
      className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
      onChange={(e) => setSelectedClassId(Number(e.target.value))}
      value={selectedClassId}
    >
      {classList.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  </div>

  <div className="flex items-center space-x-2">
    <label className="text-sm text-gray-600">Semester</label>
    <select className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
      <option>HK1 22-23</option>
      <option>HK2 22-23</option>
      <option>HK1 23-24</option>
      <option>HK2 23-24</option>
    </select>
  </div>
</div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">

          
          <EcommerceMetrics />

          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div>
      </div>
    </>
  );
}
