"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, CreditCard, Users, DollarSign, Clock, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";

export default function ECourseDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/ecourse/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Error fetching admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const formatPrice = (val) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const statCards = [
    { title: "Total Kelas", value: stats.totalCourses, icon: BookOpen, color: "bg-blue-500/10 text-blue-600" },
    { title: "Total Peserta (Lunas)", value: stats.totalParticipants, icon: Users, color: "bg-emerald-500/10 text-emerald-600" },
    { title: "Total Omzet", value: formatPrice(stats.totalRevenue), icon: DollarSign, color: "bg-indigo-500/10 text-indigo-600" },
    { title: "Konfirmasi Tertunda", value: stats.waitingConfirmation, icon: Clock, color: "bg-amber-500/10 text-amber-600" },
    { title: "Order Belum Bayar", value: stats.unpaidOrders, icon: AlertCircle, color: "bg-slate-500/10 text-slate-600" },
    { title: "Total Transaksi", value: stats.totalOrders, icon: CreditCard, color: "bg-purple-500/10 text-purple-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="glass-panel p-6 rounded-2xl border border-slate-200/40 bg-white/50 backdrop-blur-md flex items-center justify-between shadow-sm">
              <div className="space-y-1 text-xs font-semibold text-slate-700">
                <span className="text-slate-400 font-bold block">{card.title}</span>
                <span className="text-lg sm:text-2xl font-black text-slate-800 block leading-tight">{card.value}</span>
              </div>
              <div className={`p-3.5 rounded-xl ${card.color} shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Row 2: Recent Orders & Popular Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Recent Orders */}
        <div className="lg:col-span-8 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/40 bg-white/50 backdrop-blur-md shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2">
            <h3 className="font-display text-sm font-bold text-slate-800 uppercase tracking-wider">Transaksi Terbaru</h3>
            <Link href="/admin/ecourse/orders" className="text-primary font-bold text-xs hover:underline flex items-center gap-1">
              Semua Order <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto -mx-6 sm:mx-0">
            <table className="w-full text-left text-xs font-semibold text-slate-700 border-collapse min-w-[500px] px-6 sm:px-0">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="py-3 px-4 font-bold">Order ID</th>
                  <th className="py-3 px-4 font-bold">Peserta</th>
                  <th className="py-3 px-4 font-bold">Kelas</th>
                  <th className="py-3 px-4 font-bold">Total</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {stats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-400 font-medium">Belum ada transaksi masuk.</td>
                  </tr>
                ) : (
                  stats.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/40 transition">
                      <td className="py-3 px-4 font-bold text-slate-800">{order.orderCode}</td>
                      <td className="py-3 px-4">
                        <span className="block font-bold">{order.fullName}</span>
                        <span className="block text-[10px] text-slate-400">{order.whatsapp}</span>
                      </td>
                      <td className="py-3 px-4 truncate max-w-[150px]">{order.course.title}</td>
                      <td className="py-3 px-4 font-bold">{formatPrice(order.totalAmount)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                          order.paymentStatus === "PAID" ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50" :
                          order.paymentStatus === "WAITING_CONFIRMATION" ? "bg-blue-50 text-blue-700 border border-blue-200/50" :
                          order.paymentStatus === "CANCELLED" ? "bg-rose-50 text-rose-700 border border-rose-200/50" :
                          "bg-amber-50 text-amber-700 border border-amber-200/50"
                        }`}>
                          {order.paymentStatus === "PAID" ? "Lunas" :
                           order.paymentStatus === "WAITING_CONFIRMATION" ? "Menunggu Konfirmasi" :
                           order.paymentStatus === "CANCELLED" ? "Dibatalkan" : "Belum Bayar"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Popular Courses */}
        <div className="lg:col-span-4 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/40 bg-white/50 backdrop-blur-md shadow-sm space-y-4">
          <div className="pb-2">
            <h3 className="font-display text-sm font-bold text-slate-800 uppercase tracking-wider">Kelas Terpopuler</h3>
          </div>

          <div className="space-y-4">
            {stats.popularCourses.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-6 font-medium">Belum ada data pendaftaran kelas.</p>
            ) : (
              stats.popularCourses.map((course) => (
                <div key={course.id} className="p-3 bg-white/40 rounded-xl border border-slate-100 flex items-center justify-between gap-3 text-xs font-semibold">
                  <div className="min-w-0 space-y-0.5">
                    <h4 className="text-slate-800 font-bold truncate">{course.title}</h4>
                    <span className="text-[10px] text-slate-400 block">Kuota: {course.quota} Kursi</span>
                  </div>
                  <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-center shrink-0 min-w-[3rem]">
                    <span className="block font-black text-xs">{course.participantsCount}</span>
                    <span className="block text-[8px] font-bold uppercase tracking-wider leading-none">Siswa</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
