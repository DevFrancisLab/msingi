import { AppProvider } from "@/context/AppContext";
import { ChatWorkspace } from "@/components/dashboard/ChatWorkspace";
import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";

export function Dashboard() {
  return (
    <AppProvider>
      <div className="flex h-dvh flex-col overflow-hidden bg-bg">
        <Header />
        <div className="flex min-h-0 flex-1">
          <Sidebar />
          <ChatWorkspace />
        </div>
      </div>
    </AppProvider>
  );
}
