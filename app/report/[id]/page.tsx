import { ReportDetailClient } from "@/components/ReportDetailClient";

type ReportPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params;

  return <ReportDetailClient reportId={id} />;
}
