'use client';

import { Sidebar } from "@/app/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Maximize, Minimize, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DashboardClientProps {
  children: React.ReactNode;
}

export default function DashboardClient({ children }: DashboardClientProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWideLayout, setIsWideLayout] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleWideLayout = () => {
    setIsWideLayout(!isWideLayout);
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
      {/* Sidebar pour desktop */}
      <div className="hidden lg:block">
        <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
      </div>
      
      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-[250px] bg-sidebar">
            <Sidebar isCollapsed={false} onToggle={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center border-b bg-background px-4 lg:px-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
              className="mr-4 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="text-xl font-bold">ACI Santé</div>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleWideLayout}
              title={isWideLayout ? "Layout normal" : "Layout large"}
              className="hidden lg:flex mr-2"
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
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" x2="21" y1="9" y2="9" />
                <line x1="9" x2="9" y1="21" y2="9" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
              className="hidden lg:flex"
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </Button>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className={cn(
            "mx-auto transition-all duration-300",
            isWideLayout 
              ? "max-w-[1600px]" 
              : isCollapsed 
                ? "max-w-[1400px]" 
                : "max-w-[1200px]"
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