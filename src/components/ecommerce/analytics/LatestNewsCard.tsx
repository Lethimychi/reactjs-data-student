interface LatestNewsCardProps {
  className?: string;
}

export default function LatestNewsCard({
  className = "",
}: LatestNewsCardProps) {
  return (
    <article
      className={`flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      <header className="flex items-center gap-4">
        <img
          src="/images/cards/card-01.png"
          alt="Whiteboard Templates"
          className="size-14 rounded-2xl object-cover"
        />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">
            News
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Whiteboard Templates By Industry Leaders
          </p>
        </div>
      </header>

      <p className="mt-5 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
        The Nagasaki Lander is the trademarked name of several series of
        Nagasaki sport bikes that started with the 1984 ABCD.
      </p>

      <footer className="mt-6 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-gray-400">
        <span>2 years ago</span>
        <a
          href="#"
          className="text-sm font-semibold text-indigo-500 transition-colors hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Read more
        </a>
      </footer>
    </article>
  );
}
