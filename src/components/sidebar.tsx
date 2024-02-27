import flowcoreLogo from "@/images/flowcore-logo.svg"
import { BookmarkCheck, Home, Ticket, User, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Nav } from "./nav"

interface SidebarProps {
  isSidebarOpen?: boolean
  setIsSidebarOpen?: (isOpen: boolean) => void
}

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }: SidebarProps) => {
  return (
    <aside className="w-42 flex h-screen flex-col bg-slate-700 p-4 text-white ">
      <div className="mb-8 flex flex-col items-start">
        <Link
          href="/"
          onClick={() => {
            if (isSidebarOpen && setIsSidebarOpen) {
              setIsSidebarOpen(false)
            }
          }}>
          <Image src={flowcoreLogo as string} alt="Flowcore" priority />
        </Link>
      </div>
      <Nav
        links={[
          {
            href: "/",
            title: "Overview",
            label: "",
            superuserRequired: false,
            icon: Home,
          },
          {
            href: "/tickets",
            title: "Tickets",
            label: "",
            superuserRequired: false,
            icon: Ticket,
          },
          {
            href: "/contacts",
            title: "Contacts",
            label: "",
            superuserRequired: true,
            icon: Users,
          },
          {
            href: "/me",
            title: "Profile",
            label: "",
            superuserRequired: false,
            icon: User,
          },
          {
            href: "/check-in",
            title: "Check In",
            label: "",
            superuserRequired: false,
            icon: BookmarkCheck,
          },
        ]}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
    </aside>
  )
}

export default Sidebar
