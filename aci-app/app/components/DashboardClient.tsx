'use client';

import { Sidebar } from "@/app/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Maximize, Minimize } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DashboardClientProps {
  children: React.ReactNode;
}

export default function DashboardClient({ children }: DashboardClientProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Erreur de passage en plein écran: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center border-b bg-background px-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="mr-4 lg:hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </Button>
            <div className="text-xl font-bold">ACI Santé</div>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </Button>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-6">
          <div className={cn(
            "mx-auto transition-all duration-300",
            isCollapsed ? "max-w-[1200px]" : "max-w-[1000px]"
          )}>
            {children}
          </div>
        </main>
        
        <footer className="border-t py-4 text-center text-sm bg-background">
          <div className="container">
            © {new Date().getFullYear()} ACI Maison de Santé Pluriprofessionnelle
          </div>
        </footer>
      </div>
    </div>
  );
} 