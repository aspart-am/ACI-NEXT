import { Sidebar } from "@/app/components/Sidebar";
import DashboardClient from '@/app/components/DashboardClient';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardClient>
      {children}
    </DashboardClient>
  );
} 