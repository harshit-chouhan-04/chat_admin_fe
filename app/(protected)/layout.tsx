import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import ProtectedClientGuard from "./ProtectedClientGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {

  return (
    <ProtectedClientGuard>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <AppHeader />
            <main className="flex-1 p-6 overflow-auto">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedClientGuard>
  );
}
