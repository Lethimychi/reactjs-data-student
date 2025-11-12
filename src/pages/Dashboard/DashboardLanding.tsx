import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

export default function DashboardLanding() {
  return (
    <>
      <PageMeta
        title="Dashboard Overview | TailAdmin - React.js Admin Dashboard Template"
        description="Dashboard landing area ready for embedded iframe content."
      />
      <PageBreadcrumb pageTitle="Dashboard" />

      <section className="space-y-6">
        <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white text-center text-base font-medium text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300">
          Dashboard Content Here
        </div>
      </section>
    </>
  );
}

