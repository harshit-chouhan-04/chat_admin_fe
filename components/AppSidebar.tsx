'use client';
import {
  LayoutDashboard, Users, Bot, FolderOpen, MessagesSquare,
  MessageSquare, CreditCard, Receipt,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar, SidebarHeader,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Users", url: "/users", icon: Users },
  { title: "Characters", url: "/characters", icon: Bot },
  { title: "Categories", url: "/categories", icon: FolderOpen },
  { title: "Conversations", url: "/conversations", icon: MessagesSquare },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Plans", url: "/plans", icon: CreditCard },
  { title: "Invoices", url: "/invoices", icon: Receipt },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-sidebar-border">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm text-sidebar-accent-foreground">CharacterAI Admin</span>
          </div>
        ) : (
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
