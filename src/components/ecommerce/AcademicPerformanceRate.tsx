const data = [
  { subject: "Anh văn 1", rate: 12 },
  { subject: "Toán cao cấp", rate: 8 },
  { subject: "CSDL", rate: 6 },
];

export default function TopFailingSubjectsChart({
  className,
}: {
  className?: string;
}) {
  return (
    <div className="rounded-2xl bg-white shadow-md shadow-slate-200 p-6">
      <h4 className="text-lg font-semibold text-slate-800 mb-1">
        Số lượng sinh viên đậu theo từng môn
      </h4>
      <p className="text-sm text-slate-500 mb-6">Pass Rate Analysis</p>
      <div className={className ?? "w-full h-64"}>
        <div className="space-y-4">
          {data.map((d) => (
            <div key={d.subject}>
              <div className="flex justify-between text-sm mb-2">
                <div className="text-slate-700 font-medium">{d.subject}</div>
                <div className="text-slate-500">{d.rate}%</div>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all"
                  style={{ width: `${d.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
