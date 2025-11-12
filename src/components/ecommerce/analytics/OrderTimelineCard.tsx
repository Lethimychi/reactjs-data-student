interface OrderTimelineCardProps {
  className?: string;
}

type OrderEvent = {
  title: string;
  meta: string;
  amount?: string;
};

const orderTimeline: OrderEvent[] = [
  { title: "1983, orders", amount: "$4220", meta: "08 Nov 2023 12:00 am" },
  {
    title: "12 invoices have been paid",
    meta: "Invoices are paid to the company",
  },
  { title: "Order #37745 from September", meta: "New order" },
  { title: "Payout processed", meta: "Last payment for order #1003" },
];

export default function OrderTimelineCard({
  className = "",
}: OrderTimelineCardProps) {
  return (
    <section
      className={`rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      <header>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">
          Order timeline
        </h3>
      </header>

      <ol className="mt-6 space-y-6">
        {orderTimeline.map((event, index) => (
          <li key={event.title} className="relative pl-6">
            <span className="absolute left-0 top-1.5 flex size-3 items-center justify-center rounded-full bg-indigo-500">
              <span className="size-1.5 rounded-full bg-white" />
            </span>
            <div className="text-sm font-semibold text-gray-900 dark:text-white/90">
              {event.title}
              {event.amount && (
                <span className="ml-1 font-normal text-gray-500 dark:text-gray-400">
                  {event.amount}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {event.meta}
            </p>
            {index < orderTimeline.length - 1 && (
              <span className="absolute left-1.5 top-4 h-full w-px bg-gray-200 dark:bg-white/10" />
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
