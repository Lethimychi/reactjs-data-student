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
    <div className="rounded-2xl bg-white p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
      <h4 className="font-semibold text-slate-700 text-lg mb-3">
        Số lượng sinh viên đậu theo từng môn
      </h4>
      <div className={className ?? "w-full h-64"}>
        <div className="space-y-3">
          {data.map((d) => (
            <div key={d.subject}>
              <div className="flex justify-between text-sm mb-1">
                <div className="text-slate-700">{d.subject}</div>
                <div className="text-slate-500">{d.rate}%</div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div
                  className="h-2 bg-rose-500 rounded-full"
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
