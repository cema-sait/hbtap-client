'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import AuthGuard, { globalUserStore } from "../context/guard";
import { ToastContainer } from "react-toastify";
import Navbar from "./components/nav";
// import Aside from "./components/aside";
import { cn } from "@/lib/utils";
import Aside from "./components/aside";


export default function CoordinatorsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(globalUserStore.userData);

  useEffect(() => {
    setMounted(true);
    
    setUser(globalUserStore.userData);

    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    
    window.addEventListener('resize', handleResize);
    
    const userInterval = setInterval(() => {
      if (JSON.stringify(user) !== JSON.stringify(globalUserStore.userData)) {
        setUser(globalUserStore.userData);
      }
    }, 1000);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(userInterval);
    };
  }, [user]);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!mounted) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#27aae1] border-t-transparent mb-4"></div>
        <p className="text-gray-600 font-medium">Please wait...</p>
      </div>
    );
  }

  return (
    <AuthGuard publicRoutes={['/auth/login']}>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar 
          isSidebarOpen={isSidebarOpen} 
          onSidebarToggle={handleSidebarToggle} 
        />

        <div className="flex flex-1 pt-16">
          <Aside 
            isOpen={isSidebarOpen} 
            onToggle={handleSidebarToggle} 
            user={user}
          />

          <main
            className={cn(
              "flex-1 transition-all duration-300 ease-in-out overflow-x-hidden",
              isSidebarOpen && "lg:ml-64",
              "w-full"
            )}
          >
            <div className="min-h-full bg-white px-0 py-4 lg:px-4 xl:px-6">

              {children}
            </div>
          </main>
        </div>

        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastClassName="text-sm"
        />
      </div>
    </AuthGuard>

  );
}
