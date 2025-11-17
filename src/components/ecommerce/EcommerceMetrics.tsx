import { useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";

import MonthlySalesChart from "./MonthlySalesChart";

export default function EcommerceMetrics() {
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

  // prevent unused variable lint during iterative development
  void shorten;
  void selectedClassId;
  void setSelectedClassId;

  return (
    <div className="space-y-6">
      {/* Filters row: placed first and horizontal */}

      {/* Top ecommerce metrics (kept intact) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
        {/* <!-- Metric Item Start --> */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
          </div>

          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Customers
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                3,782
              </h4>
            </div>
            <Badge color="success">
              <ArrowUpIcon />
              11.01%
            </Badge>
          </div>
        </div>
        {/* <!-- Metric Item End --> */}

        {/* <!-- Metric Item Start --> */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Orders
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                5,359
              </h4>
            </div>

            <Badge color="error">
              <ArrowDownIcon />
              9.05%
            </Badge>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Orders
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                5,359
              </h4>
            </div>

            <Badge color="error">
              <ArrowDownIcon />
              9.05%
            </Badge>
          </div>
        </div>
        {/* <!-- Metric Item End --> */}
      </div>

      <MonthlySalesChart />
      {/* Academic Advisor Dashboard */}
    </div>
  );
}
