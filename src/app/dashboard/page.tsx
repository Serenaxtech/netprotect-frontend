"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthService } from "@/services/authService"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Home, Users, Settings, LogOut, Building, PlusCircle, Shield, AlertTriangle, UserCog, Users2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useOrganizationCreation } from "@/hooks/useOrganizationCreation"
import CreateOrganizationPage from '../organizations/create/page';
import CreateAgentPage from '../agents/create/page';
import VulnerabilityPage from '../vulnerability/ftp/page';
import KerberosPage from '../vulnerability/kerberos/page';
import ListAgentsPage from '../agents/list/page';
import ListOrganizationsPage from '../organizations/list/page';
import OrganizationDetailsPage from '../organizations/[id]/page';

interface UserData {
  role?: string;
  firstName?: string;
  lastName?: string;
}

// Update the View type
type View = 'dashboard' | 'create-organization' | 'users' | 'settings' | 'create-agent' | 'list-agents' | 'vulnerability-ftp' | 'vulnerability-kerberos' | 'list-organizations' | 'organization-details';

export default function DashboardPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [agentsMenuOpen, setAgentsMenuOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  
  const toggleAgentsMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAgentsMenuOpen(!agentsMenuOpen);
  };

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.agents-menu-container')) {
          setAgentsMenuOpen(false);
        }
      };

      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }, []);

  const [organizationsMenuOpen, setOrganizationsMenuOpen] = useState(false);

  const toggleOrganizationsMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOrganizationsMenuOpen(!organizationsMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.organizations-menu-container')) {
        setOrganizationsMenuOpen(false);
      }
    };
  
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const data = await AuthService.checkAuth()
          if (!data) {
            router.push('/login')
            return
          }
          setUserData(data)
        } catch (error) {
          router.push('/login')
        } finally {
          setLoading(false)
        }
      }
  
      checkAuth()
    }, [router])

  const handleLogout = async () => {
    try {
      await AuthService.logout()
      toast.success("Logged out", {
        description: "You have been successfully logged out"
      })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      toast.error("Error", {
        description: "Failed to logout. Please try again."
      })
    }
  }

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded)
  }

  
  
  // Update the renderMainContent function to include the vulnerability view
  const renderMainContent = () => {
    switch (currentView) {
      case 'vulnerability-ftp':
        return <VulnerabilityPage />;

      case 'vulnerability-kerberos':
        return <KerberosPage />;

      case 'create-organization':
        return <CreateOrganizationPage />;

      case 'create-agent':
        return <CreateAgentPage />;

      case 'list-agents':
        return <ListAgentsPage />;
        
        case 'list-organizations':
          return <ListOrganizationsPage onSelectOrg={(orgId) => {
            setSelectedOrgId(orgId);
            setCurrentView('organization-details');
          }} />;
    
        case 'organization-details':
          return selectedOrgId ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setCurrentView('list-organizations');
                    setSelectedOrgId(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Organizations
                </Button>
              </div>
              <OrganizationDetailsPage organizationId={selectedOrgId} />
            </div>
          ) : null;
      case 'dashboard':
      default:
        return (
          <div className="space-y-6">
            <Card className="bg-[#111] border-gray-800 shadow-lg">
              <CardHeader className="space-y-4">
                <div className="text-gray-400 text-center text-sm">[ Welcome to NetProtect ]</div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-center text-white">
                  Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center text-gray-300 text-sm md:text-base">
                    Welcome back! You are logged in as a {userData?.role || 'user'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <Card className="bg-[#1A1A1A] border-gray-800">
                      <CardHeader>
                        <CardTitle className="text-xl text-white">Organizations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-400">Manage your organizations and their settings</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-[#1A1A1A] border-gray-800">
                      <CardHeader>
                        <CardTitle className="text-xl text-white">Users</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-400">Manage users and their permissions</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-[#1A1A1A] border-gray-800">
                      <CardHeader>
                        <CardTitle className="text-xl text-white">Settings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-400">Configure your account settings</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-[#1A1A1A] border-gray-800">
                      <CardHeader>
                        <CardTitle className="text-xl text-white">Agents</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-400">Manage your Active Directory monitoring agents</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
  }
};

if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-white">Loading...</div>
    </div>
  )
}

return (
  <div className="min-h-screen flex bg-black">
    {/* Sidebar */}
    <div className={`h-screen bg-[#111] border-r border-gray-800 transition-all duration-300 flex flex-col justify-between ${sidebarExpanded ? 'w-64' : 'w-20'}`}>
      {/* Top navigation buttons */}
      <div className="flex flex-col">
        {/* Toggle button */}
        <button 
          onClick={toggleSidebar}
          className="p-4 text-gray-400 hover:text-white self-end"
        >
          {sidebarExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
        
        {/* Navigation items */}
        <div className="flex flex-col space-y-2 px-4 py-2">
          <Button 
            variant="ghost" 
            className={`flex items-center justify-${sidebarExpanded ? 'start' : 'center'} text-gray-300 hover:text-white hover:bg-[#1A1A1A]`}
            onClick={() => setCurrentView('dashboard')}
          >
            <Home size={20} />
            {sidebarExpanded && <span className="ml-3">Dashboard</span>}
          </Button>
          
          {userData?.role === 'root' && (
            <>
              <div className="organizations-menu-container relative">
                <Button 
                  variant="ghost" 
                  className={`flex items-center justify-${sidebarExpanded ? 'start' : 'center'} text-gray-300 hover:text-white hover:bg-[#1A1A1A] w-full`}
                  onClick={toggleOrganizationsMenu}
                >
                  <Building size={20} />
                  {sidebarExpanded && (
                    <>
                      <span className="ml-3">Organizations</span>
                      <ChevronRight
                        size={16}
                        className={`ml-auto transition-transform ${organizationsMenuOpen ? 'rotate-90' : ''}`}
                      />
                    </>
                  )}
                </Button>
                
                {/* Organizations Submenu */}
                <div
                  className={`absolute left-full top-0 ml-2 bg-[#1A1A1A] border border-gray-800 rounded-md overflow-hidden transition-all duration-200 ${organizationsMenuOpen ? 'visible opacity-100 translate-x-0' : 'invisible opacity-0 -translate-x-2'}`}
                  style={{ zIndex: 50 }}
                >
                  <div className="py-2">
                    <Button
                      variant="ghost"
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#252525]"
                      onClick={() => {
                        setCurrentView('create-organization');
                        setOrganizationsMenuOpen(false);
                      }}
                    >
                      <PlusCircle size={18} className="mr-2" />
                      Create Organization
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#252525]"
                      onClick={() => {
                        setCurrentView('list-organizations');
                        setOrganizationsMenuOpen(false);
                      }}
                    >
                      <Building size={18} className="mr-2" />
                      List Organizations
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {(userData?.role === 'root' || userData?.role === 'integrator') && (
            <div className="relative agents-menu-container">
                <Button 
                  variant="ghost" 
                  className={`w-full flex items-center justify-${sidebarExpanded ? 'start' : 'center'} text-gray-300 hover:text-white hover:bg-[#1A1A1A] ${agentsMenuOpen ? 'bg-[#1A1A1A] text-white' : ''}`}
                  onClick={toggleAgentsMenu}
                  aria-expanded={agentsMenuOpen}
                  aria-haspopup="true"
                >
                  <UserCog size={20} />
                  {sidebarExpanded && <span className="ml-3">Agents</span>}
                </Button>
                
                <div 
                  className={`
                    absolute ${sidebarExpanded ? 'left-full' : 'left-full'} top-0
                    w-48 bg-[#1A1A1A] border border-gray-800 rounded-md shadow-lg
                    transform transition-all duration-200 ease-in-out
                    ${agentsMenuOpen ? 'translate-x-0 opacity-100 visible' : 'translate-x-1 opacity-0 invisible'}
                    z-50
                  `}
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="agents-menu-button"
                >
                  <div className="py-2" role="none">
                    <Button
                      variant="ghost"
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#252525] transition-colors duration-150"
                      onClick={() => {
                        setCurrentView('create-agent');
                        setAgentsMenuOpen(false);
                      }}
                      role="menuitem"
                    >
                      <PlusCircle size={18} className="mr-2" />
                      Create Agent
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#252525] transition-colors duration-150"
                      onClick={() => {
                        setCurrentView('list-agents');
                        setAgentsMenuOpen(false);
                      }}
                      role="menuitem"
                    >
                      <Users2 size={18} className="mr-2" />
                      List Agents
                    </Button>
                  </div>
                </div>
              </div>
          )}
          <Button 
            variant="ghost" 
            className={`flex items-center justify-${sidebarExpanded ? 'start' : 'center'} text-gray-300 hover:text-white hover:bg-[#1A1A1A]`}
          >
            <Users size={20} />
            {sidebarExpanded && <span className="ml-3">Users</span>}
          </Button>
          
          <Button 
            variant="ghost" 
            className={`flex items-center justify-${sidebarExpanded ? 'start' : 'center'} text-gray-300 hover:text-white hover:bg-[#1A1A1A]`}
          >
            <Settings size={20} />
            {sidebarExpanded && <span className="ml-3">Settings</span>}
          </Button>
          <div className="flex flex-col space-y-2">
            <Button 
              variant="ghost" 
              className={`flex items-center justify-${sidebarExpanded ? 'start' : 'center'} text-gray-300 hover:text-white hover:bg-[#1A1A1A] w-full`}
              onClick={() => setCurrentView('vulnerability-ftp')}
            >
              <AlertTriangle size={20} />
              {sidebarExpanded && <span className="ml-3">FTP Vulnerabilities</span>}
            </Button>
            
            <Button 
              variant="ghost" 
              className={`flex items-center justify-${sidebarExpanded ? 'start' : 'center'} text-gray-300 hover:text-white hover:bg-[#1A1A1A] w-full`}
              onClick={() => setCurrentView('vulnerability-kerberos')}
            >
              <AlertTriangle size={20} />
              {sidebarExpanded && <span className="ml-3">Kerberos Vulnerabilities</span>}
            </Button>
        </div>
        </div>
      </div>
      
      {/* Bottom profile and logout */}
      <div className="flex flex-col space-y-4 p-4 mb-6">
        {/* Profile circle */}
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-semibold">
            {userData?.firstName?.charAt(0) || userData?.lastName?.charAt(0) || 'U'}
          </div>
          {sidebarExpanded && (
            <div className="ml-3 text-gray-300">
              <div className="font-medium">{userData?.firstName} {userData?.lastName}</div>
              <div className="text-xs text-gray-400">{userData?.role}</div>
            </div>
          )}
        </div>
        
        {/* Logout button */}
        <Button 
          variant="ghost" 
          className={`flex items-center justify-${sidebarExpanded ? 'start' : 'center'} text-gray-300 hover:text-white hover:bg-[#1A1A1A]`}
          onClick={handleLogout}
        >
          <LogOut size={20} />
          {sidebarExpanded && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </div>
    
    {/* Main content */}
    <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {renderMainContent()}
      </div>
    </div>
  </div>
);
}
