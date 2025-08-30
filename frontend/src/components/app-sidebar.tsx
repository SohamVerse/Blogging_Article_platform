// app-sidebar.tsx
'use client';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { PanelLeft, Home, User, Settings, FileText, Users, MailQuestion, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/actions/auth";

export function AppSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {/* <span className="items-center"><PanelLeft className="w-5 h-5" /></span> */}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard" passHref legacyBehavior>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                  <a><Home className="mr-2" /> Home</a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/blog" passHref legacyBehavior>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/blog"}>
                  <a><FileText className="mr-2" /> Blogs</a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/community" passHref legacyBehavior>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/community"}>
                  <a><Users className="mr-2" /> Community</a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/enquire" passHref legacyBehavior>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/enquire"}>
                  <a><MailQuestion className="mr-2" /> Enquiries</a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            {/* <SidebarMenuItem>
              <Link href="/dashboard/settings" passHref legacyBehavior>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/settings"}>
                  <a><Settings className="mr-2" /> Settings</a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem> */}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          {/* Add more menu items or groups as needed */}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut className="mr-2" /> Logout
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}