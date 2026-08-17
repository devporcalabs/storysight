"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, BookOpen, CreditCard, Users, Settings, FileText } from "lucide-react";

export default function ECourseAdminLayout({ children }) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/admin/ecourse", icon: BarChart2, exact: true },
    { name: "Courses", href: "/admin/ecourse/courses", icon: BookOpen, exact: false },
    { name: "Orders", href: "/admin/ecourse/orders", icon: CreditCard, exact: false },
    { name: "Participants", href: "/admin/ecourse/participants", icon: Users, exact: false },
    { name: "Reports", href: "/admin/ecourse/reports", icon: FileText, exact: false },
    { name: "Payment Settings", href: "/admin/ecourse/settings", icon: Settings, exact: false },
  ];

  return (
    <div className="space-y-6">
      {/* Secondary E-Course Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-200/60 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight font-display">Modul E-Course</h1>
          <p className="text-slate-400 text-xs mt-1">Kelola kelas, pendaftaran peserta, verifikasi kuitansi pembayaran manual, dan laporan pendapatan.</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200/50 pb-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          // Exact match or sub-path match (ignoring exact /admin/ecourse comparison for sub-items)
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname.startsWith(item.href) && (item.href !== "/admin/ecourse" || pathname === "/admin/ecourse");
            
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]"
                  : "bg-white/50 hover:bg-white text-slate-500 hover:text-slate-700 border border-slate-200/30"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Page Content */}
      <div className="pt-2">
        {children}
      </div>
    </div>
  );
}
