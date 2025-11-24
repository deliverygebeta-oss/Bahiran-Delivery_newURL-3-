import ManagerSidebar from "../components/Sidebar/M-sidebar";
import { useState } from "react";
import { PanelLeftClose, PanelRightClose } from "lucide-react";
import TopDash from "../pages/TopDash";
const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex">
      {sidebarOpen && (
        <>
          {/* Backdrop on tablet/mobile so sidebar overlays content */}
          <div
            className="fixed inset-0 bg-black/30 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full z-30 lg:static lg:h-auto">
            <div className="motion-preset-slide-right motion-duration-300">
              <ManagerSidebar />
            </div>
          </div>
        </>
      )}
      <button
        className={`fixed top-[77px] left-0 bg-[#e0cda9] p-2 border border-[#ceb07a] rounded-r-lg transition-all duration-300 z-40 ${sidebarOpen ? "" : "pl-3"}`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? (
          <PanelLeftClose size={25} />
        ) : (
          <PanelRightClose size={25} />
        )}
      </button>
      <div className="flex flex-col w-[100%] h-[100%]">
      <TopDash /> 
      <main className="w-[100%] h-[100%]">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
