type ScoreRecord = {
  subject: string;
  credits: number | string;
  mid?: number | string;
  final?: number | string;
  average?: number | string;
  status?: "Đậu" | "Rớt" | string;
};

const mockData: ScoreRecord[] = [
  {
    subject: "Kho dữ liệu và OLAP",
    credits: 2,
    mid: 6.0,
    final: 4.5,
    average: 5.3,
    status: "Đậu",
  },
  {
    subject: "Thực hành cơ sở dữ liệu NoSQL",
    credits: 1,
    mid: 6.0,
    final: 6.5,
    average: 6.2,
    status: "Đậu",
  },
  {
    subject: "Thực hành Kho dữ liệu và OLAP",
    credits: 1,
    mid: "-",
    final: 5.1,
    average: 5.1,
    status: "Đậu",
  },
];

export default function ScoreDetail({
  title = "Bảng điểm chi tiết - HK1 2024-2025",
  records = mockData,
}: {
  title?: string;
  records?: ScoreRecord[];
}) {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
      <div className="px-6 pt-6">
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      </div>

      <div className="mt-4 overflow-hidden rounded-b-2xl border-t border-gray-100">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3">
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-6 text-white font-semibold">Môn học</div>
            <div className="col-span-1 text-white font-semibold text-center">
              Tín chỉ
            </div>
            <div className="col-span-1 text-white font-semibold text-center">
              GK
            </div>
            <div className="col-span-1 text-white font-semibold text-center">
              CK
            </div>
            <div className="col-span-1 text-white font-semibold text-center">
              TB
            </div>
            <div className="col-span-2 text-white font-semibold text-center">
              Trạng thái
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="divide-y divide-gray-100">
            {records.map((r, idx) => (
              <div
                key={`${r.subject}-${idx}`}
                className="grid grid-cols-12 gap-4 items-center py-4"
              >
                <div className="col-span-6 text-sm text-slate-700">
                  {r.subject}
                </div>
                <div className="col-span-1 text-center text-sm text-slate-500">
                  {r.credits}
                </div>
                <div className="col-span-1 text-center text-sm text-slate-500">
                  {r.mid ?? "-"}
                </div>
                <div className="col-span-1 text-center text-sm text-slate-500">
                  {r.final ?? "-"}
                </div>
                <div className="col-span-1 text-center">
                  <span className="text-sm font-semibold text-blue-600">
                    {r.average ?? "-"}
                  </span>
                </div>
                <div className="col-span-2 text-center">
                  <span
                    className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium ${
                      r.status === "Đậu"
                        ? "bg-green-100 text-green-800"
                        : r.status === "Rớt"
                        ? "bg-red-100 text-red-800"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
