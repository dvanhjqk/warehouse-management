import React from "react";
import { getMonthlyAnalytics } from "@/app/actions/analytics-actions";
import { MonthlyAnalyticsView } from "@/components/analytics/monthly-analytics-view";

export const dynamic = "force-dynamic";

interface AnalyticsPageProps {
  searchParams: Promise<{
    year?: string;
    month?: string;
  }>;
}

export default async function AnalyticsPage({
  searchParams,
}: AnalyticsPageProps) {
  const params = await searchParams;
  const year = params.year ? parseInt(params.year, 10) : undefined;
  const month = params.month ? parseInt(params.month, 10) : undefined;

  const data = await getMonthlyAnalytics(year, month);

  return <MonthlyAnalyticsView initialData={data} />;
}
