import React from 'react';
import {
  Users,
  Building2,
  CheckCircle,
  CreditCard,
  Bell,
  Settings,
  Languages,
  FileText,
  Music,
  Database,
  Mail,
  BookOpen
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuGroups = [
  {
    title: "Gestion des utilisateurs",
    items: [
      { id: "artists", title: "Artistes", icon: Users },
      { id: "professionals", title: "Professionnels", icon: Building2 },
      { id: "verification", title: "Vérification", icon: CheckCircle },
    ]
  },
  {
    title: "Gestion commerciale",
    items: [
      { id: "upgrades", title: "Upgrades", icon: CreditCard },
      { id: "payments", title: "Paiements", icon: CreditCard },
    ]
  },
  {
    title: "Communication",
    items: [
      { id: "notifications", title: "Notifications", icon: Bell },
      { id: "invitations", title: "Invitations", icon: Mail },
    ]
  },
  {
    title: "Contenu & Données",
    items: [
      { id: "blog", title: "Blog", icon: FileText },
      { id: "lyrical-works", title: "Œuvres lyriques", icon: Music },
      { id: "opera-database", title: "Base Opéra", icon: Database },
      { id: "notices", title: "Notices", icon: BookOpen },
      { id: "translations", title: "Traductions", icon: Languages },
    ]
  },
  {
    title: "Système",
    items: [
      { id: "workflows", title: "Workflows", icon: Settings },
    ]
  }
];

export default function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-sidebar-foreground/70">
              {!isCollapsed && group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(item.id)}
                      className={`w-full justify-start ${
                        activeTab === item.id
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span className="ml-2">{item.title}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}