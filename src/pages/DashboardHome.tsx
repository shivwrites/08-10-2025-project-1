import StatsOverview from '../components/dashboard/StatsOverview';
import AnalyticsCharts from '../components/dashboard/AnalyticsCharts';
import RecentActivity from '../components/dashboard/RecentActivity';

export default function DashboardHome() {
  return (
    <>
      <StatsOverview />
      <AnalyticsCharts />
      <RecentActivity />
    </>
  );
}
