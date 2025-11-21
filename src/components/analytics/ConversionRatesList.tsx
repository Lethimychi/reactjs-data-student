interface ConversionRatesListProps {
  className?: string;
}

type ConversionItem = {
  country: string;
  values: {
    label: string;
    value: number;
    colorClass: string;
  }[];
};

const conversionItems: ConversionItem[] = [
  {
    country: "Italy",
    values: [
      { label: "Series 1", value: 47, colorClass: "bg-blue-500" },
      { label: "Series 2", value: 53, colorClass: "bg-amber-400" },
    ],
  },
  {
    country: "Japan",
    values: [
      { label: "Series 1", value: 32, colorClass: "bg-blue-500" },
      { label: "Series 2", value: 55, colorClass: "bg-amber-400" },
    ],
  },
  {
    country: "China",
    values: [
      { label: "Series 1", value: 38, colorClass: "bg-blue-500" },
      { label: "Series 2", value: 47, colorClass: "bg-amber-400" },
    ],
  },
  {
    country: "Canada",
    values: [
      { label: "Series 1", value: 58, colorClass: "bg-blue-500" },
      { label: "Series 2", value: 52, colorClass: "bg-amber-400" },
    ],
  },
  {
    country: "France",
    values: [
      { label: "Series 1", value: 13, colorClass: "bg-blue-500" },
      { label: "Series 2", value: 43, colorClass: "bg-amber-400" },
    ],
  },
];

export default function ConversionRatesList({
  className = "",
}: ConversionRatesListProps) {
  return (
    <div
      className={`rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <header>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">
            Conversion rates
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            +43% than last year
          </p>
        </header>
        <ul className="flex items-center gap-4 text-xs font-medium uppercase tracking-wide text-gray-400">
          <li className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-blue-500" />
            Series 1
          </li>
          <li className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-amber-400" />
            Series 2
          </li>
        </ul>
      </div>

      <div className="mt-6 space-y-5">
        {conversionItems.map((item) => (
          <div key={item.country}>
            <div className="text-sm font-semibold text-gray-700 dark:text-white/90">
              {item.country}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {item.values.map((value) => (
                <div key={value.label} className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{value.label}</span>
                    <span className="font-semibold text-gray-700 dark:text-white/90">
                      {value.value}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-white/10">
                    <div
                      className={`h-full rounded-full ${value.colorClass}`}
                      style={{ width: `${value.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
