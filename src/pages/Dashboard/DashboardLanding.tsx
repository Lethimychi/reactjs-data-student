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
        <div className="w-full">
          <div className="w-full bg-transparent">
            <iframe
              id="pbiframe"
              title="test16_11"
              src="https://app.powerbi.com/view?r=eyJrIjoiMmQ1M2JiNjQtOGI5Yy00MTMzLTllOTQtYjlmM2I1MmE5NGJjIiwidCI6IjczMWY3M2YzLWM1OTMtNDk0Yi04NDYwLWUwNjlkZDFiYTllOSJ9"
              className="w-full h-[calc(100vh-7rem)] border-0"
              style={{ border: 0 }}
              frameBorder={0}
              allowFullScreen
            />
          </div>
        </div>
      </section>
    </>
  );
}
