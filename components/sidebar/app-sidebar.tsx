"use client"

import {
  BookOpen,
  Bot,
  Moon,
  Sun,
  SquareTerminal
} from "lucide-react"
import * as React from "react"

import { NavUser } from "@/components/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
    },
    {
      title: "Habits",
      url: "/habits",
      icon: Bot,
    },
    {
      title: "Sleep",
      url: "/sleep",
      icon: BookOpen,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false); // Track if component has mounted on client

  // Ensure theme is only used after mounting on the client
  React.useEffect(() => {
    setMounted(true);
  }, [])


  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* <div className="ml-3 flex-1 text-xl font-bold">Drive</div> */}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {/* <SidebarGroupLabel>Main Menu</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      item.url === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.url)
                    }
                  >
                    <Link href={item.url} className="flex items-center gap-2">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuItem>
          {mounted ? (
            <SidebarMenuButton
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="w-full justify-start"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="ml-4">{theme === "light" ? "Dark" : "Light"} mode</span>
            </SidebarMenuButton>
          ) : (
            <SidebarMenuButton className="w-full justify-start">
              <Sun className="h-5 w-5" />
              <span className="ml-4">Loading...</span>
            </SidebarMenuButton>
          )}
        </SidebarMenuItem>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
