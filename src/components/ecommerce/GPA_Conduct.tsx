import { useEffect, useMemo, useState } from "react";
import {
  ScatterChart,
  Scatter,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { COLORS } from "../../utils/colors";
import { fetchGpaConductByClass } from "../../utils/ClassLecturerApi";

export default function GPAConductScatter({
  selectedClassName,
  selectedSemesterDisplayName,
  prefetchedData,
}: {
  selectedClassName?: string | null;
  selectedSemesterDisplayName?: string | null;
  prefetchedData?: Array<{
    studentName: string;
    gpa: number;
    conduct: number;
  }> | null;
}) {
  const [data, setData] = useState<
    Array<{ studentName: string; gpa: number; conduct: number }>
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If parent provided prefetched data (from React Query), use it and skip fetching
    if (prefetchedData && Array.isArray(prefetchedData)) {
      setData(prefetchedData);
      setLoading(false);
      return;
    }
    let mounted = true;
    const cls = selectedClassName ?? undefined;
    const sem = selectedSemesterDisplayName ?? undefined;
    // require class to be selected; allow semester to be omitted (helper has a fallback)
    if (!cls) {
      setData([]);
      return;
    }

    const load = async () => {
      setLoading(true);
      console.debug("GPA_Conduct: loading data for class/semester:", {
        cls,
        sem,
      });
      try {
        // If a semester is selected, require a strict semester match (no fallback to other semesters)
        const requireSemesterMatch = !!sem;
        const res = await fetchGpaConductByClass(
          cls,
          sem,
          requireSemesterMatch
        );
        console.debug("GPA_Conduct: fetchGpaConductByClass returned", {
          length: res.length,
        });
        if (!mounted) return;
        setData(res);
      } catch (e) {
        console.error("GPA_Conduct: error fetching GPA/DRL", e);
        if (!mounted) return;
        setData([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [selectedClassName, selectedSemesterDisplayName, prefetchedData]);

  const gpaValues = useMemo(() => data.map((d) => d.gpa), [data]);
  const conductValues = useMemo(() => data.map((d) => d.conduct), [data]);

  const minGpa = gpaValues.length
    ? Math.floor(Math.min(...gpaValues) * 10) / 10
    : 0;
  const maxGpa = gpaValues.length
    ? Math.ceil(Math.max(...gpaValues) * 10) / 10
    : 10;
  const minConduct = conductValues.length
    ? Math.floor(Math.min(...conductValues) / 5) * 5
    : 0;
  const maxConduct = conductValues.length
    ? Math.ceil(Math.max(...conductValues) / 5) * 5
    : 100;

  // Ensure axis domains have a non-zero span so Recharts can render points
  let xMin = minGpa;
  let xMax = maxGpa;
  if (xMin === xMax) {
    xMin = Math.max(0, xMin - 1);
    xMax = xMax + 1;
  }

  let yMin = minConduct;
  let yMax = maxConduct;
  if (yMin === yMax) {
    // expand by 5 on y-axis (percent-like scale), ensure non-negative
    yMin = Math.max(0, yMin - 5);
    yMax = yMax + 5;
    if (yMin === yMax) yMax = yMin + 5;
  }

  // keep tooltip props as a loose record and narrow below to avoid strict recharts generics
  const CustomTooltip = (props: Record<string, unknown>) => {
    const active = props["active"] as boolean | undefined;
    const payload = props["payload"] as unknown[] | undefined;
    if (!active || !payload || !payload.length) return null;
    const inner = payload[0] as Record<string, unknown>;
    const point = inner["payload"] as {
      studentName: string;
      gpa: number;
      conduct: number;
    };
    return (
      <div className="bg-white border border-slate-200 rounded shadow-lg text-sm text-slate-800 p-2">
        <div className="font-medium">{point.studentName}</div>
        <div className="text-slate-500">
          GPA: <span className="font-medium">{point.gpa.toFixed(2)}</span>
        </div>
        <div className="text-slate-500">
          Điểm rèn luyện: <span className="font-medium">{point.conduct}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h4 className="text-lg font-semibold text-slate-800 mb-1">
        Sự tương quan giữa GPA và điểm rèn luyện sinh viên
      </h4>
      <p className="text-sm text-slate-500 mb-4">
        {selectedClassName && (
          <span className="text-xs text-slate-500">
            Lớp: <span className="font-medium">{selectedClassName}</span>
            {selectedSemesterDisplayName && (
              <span>{" • " + selectedSemesterDisplayName}</span>
            )}
          </span>
        )}
      </p>

      <div className="w-full h-[260px]">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center text-sm text-slate-500">
            Đang tải...
          </div>
        ) : data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">
            Không có dữ liệu
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
              <CartesianGrid
                stroke="#CBD5E1"
                strokeDasharray="3 3"
                opacity={0.4}
              />

              <XAxis
                type="number"
                dataKey="gpa"
                domain={[xMin, xMax]}
                tick={{ fontSize: 12, fill: "#475569" }}
                tickLine={false}
                axisLine={{ stroke: "#CBD5E1" }}
                label={{
                  value: "GPA",
                  position: "insideBottomRight",
                  offset: -5,
                  fill: "#334155",
                  fontSize: 12,
                }}
              />

              <YAxis
                type="number"
                dataKey="conduct"
                domain={[yMin, yMax]}
                tick={{ fontSize: 12, fill: "#475569" }}
                tickLine={false}
                axisLine={{ stroke: "#CBD5E1" }}
                label={{
                  value: "Điểm rèn luyện",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#334155",
                  fontSize: 12,
                  offset: 0,
                }}
              />

              <Tooltip
                cursor={{ strokeDasharray: "3 3", stroke: "#94A3B8" }}
                contentStyle={{
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #CBD5E1",
                  borderRadius: "10px",
                  color: "#0F172A",
                  padding: "8px 10px",
                }}
                content={(props) => <CustomTooltip {...props} />}
              />

              {/* custom shape ensures visible blue circle markers */}
              <Scatter
                name="Sinh viên"
                data={data}
                fill={COLORS[0]}
                shape={(props: { cx?: number; cy?: number }) => (
                  <circle cx={props.cx} cy={props.cy} r={6} fill={COLORS[0]} />
                )}
              />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
