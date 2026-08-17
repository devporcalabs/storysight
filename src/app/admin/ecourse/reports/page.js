"use client";
import { useEffect, useState } from "react";
import { Search, Filter, Download, DollarSign, Calendar, RefreshCw, BarChart2 } from "lucide-react";

export default function ReportsManagement() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (startDate) query.append("startDate", startDate);
      if (endDate) query.append("endDate", endDate);

      // Fetch orders to calculate stats locally based on date range filter
      const res = await fetch(`/api/admin/ecourse/orders?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);

        // Calculate statistics
        const total = data.length;
        const paid = data.filter(o => o.paymentStatus === "PAID").length;
        const unpaid = data.filter(o => o.paymentStatus === "UNPAID").length;
        const waiting = data.filter(o => o.paymentStatus === "WAITING_CONFIRMATION").length;
        const cancelled = data.filter(o => o.paymentStatus === "CANCELLED").length;
        
        const omzet = data
          .filter(o => o.paymentStatus === "PAID")
          .reduce((sum, o) => sum + o.totalAmount, 0);

        setStats({
          totalOrders: total,
          paidOrders: paid,
          unpaidOrders: unpaid,
          waitingConfirmation: waiting,
          cancelledOrders: cancelled,
          totalRevenue: omzet,
          totalParticipants: paid
        });
      }
    } catch (err) {
      console.error("Error loading report data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set default range to last 30 days
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
    
    // We will let the useEffect's setting trigger fetch via fetchReportsData in useEffect or trigger it manually
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchReportsData();
    }
  }, [startDate, endDate]);

  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert("Tidak ada data transaksi untuk diexport.");
      return;
    }

    const headers = ["Order ID", "Nama Lengkap", "Email", "WhatsApp", "Kelas", "Nilai Transaksi", "Metode", "Status", "Tanggal"];
    const rows = orders.map(o => [
      o.orderCode,
      o.fullName,
      o.email,
      `'${o.whatsapp}`,
      o.course.title,
      o.totalAmount,
      o.paymentMethod?.bankName || o.paymentMethod?.type || "-",
      o.paymentStatus,
      new Date(o.createdAt).toLocaleDateString("id-ID")
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(","), ...rows.map(r => r.map(val => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `storysight_ecourse_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatPrice = (val) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      
      {/* Date Filters Card */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-200/40 bg-white/50 backdrop-blur-md shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-semibold text-slate-700">
          
          {/* Inputs */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 text-[10px] font-bold">Tanggal Mulai</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 text-[10px] font-bold">Tanggal Akhir</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none bg-white"
              />
            </div>
            <button
              onClick={fetchReportsData}
              className="mt-5 px-4 py-2 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 rounded-xl transition cursor-pointer flex items-center gap-1 shadow-inner"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reload
            </button>
          </div>

          {/* Export button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/50 text-xs font-bold transition cursor-pointer self-end sm:self-auto"
          >
            <Download className="w-4 h-4" /> Download Laporan (CSV)
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : stats ? (
        <div className="space-y-8 animate-fade-in">
          
          {/* Stat Cards Localized */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="glass-panel p-6 rounded-2xl border border-slate-200/40 bg-white/50 flex items-center justify-between shadow-sm">
              <div className="space-y-1 text-xs font-semibold text-slate-700">
                <span className="text-slate-400 font-bold block">Total Omzet Periode Ini</span>
                <span className="text-lg sm:text-2xl font-black text-emerald-600 block leading-none">{formatPrice(stats.totalRevenue)}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0"><DollarSign className="w-6 h-6" /></div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-200/40 bg-white/50 flex items-center justify-between shadow-sm">
              <div className="space-y-1 text-xs font-semibold text-slate-700">
                <span className="text-slate-400 font-bold block">Total Siswa Terdaftar</span>
                <span className="text-lg sm:text-2xl font-black text-slate-800 block leading-none">{stats.totalParticipants} Siswa</span>
              </div>
              <div className="p-3.5 rounded-xl bg-blue-50 text-blue-600 shrink-0"><BarChart2 className="w-6 h-6" /></div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-200/40 bg-white/50 flex items-center justify-between shadow-sm">
              <div className="space-y-1 text-xs font-semibold text-slate-700">
                <span className="text-slate-400 font-bold block">Rasio Sukses Transaksi</span>
                <span className="text-lg sm:text-2xl font-black text-slate-800 block leading-none">
                  {stats.totalOrders > 0 ? `${Math.round((stats.paidOrders / stats.totalOrders) * 100)}%` : "0%"}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0"><Calendar className="w-6 h-6" /></div>
            </div>
          </div>

          {/* Breakdown cards */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/40 bg-white/50 backdrop-blur-md shadow-sm space-y-4">
            <h4 className="font-display text-sm font-bold text-slate-800 uppercase tracking-wider">Metrik Rincian Transaksi</h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs font-semibold text-slate-600">
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                <span className="text-slate-400 font-bold block">Lunas (PAID)</span>
                <span className="text-lg sm:text-2xl font-black text-emerald-600 block mt-1">{stats.paidOrders}</span>
              </div>
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                <span className="text-slate-400 font-bold block">Menunggu (WAITING)</span>
                <span className="text-lg sm:text-2xl font-black text-blue-600 block mt-1">{stats.waitingConfirmation}</span>
              </div>
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                <span className="text-slate-400 font-bold block">Belum Bayar (UNPAID)</span>
                <span className="text-lg sm:text-2xl font-black text-amber-600 block mt-1">{stats.unpaidOrders}</span>
              </div>
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                <span className="text-slate-400 font-bold block">Dibatalkan</span>
                <span className="text-lg sm:text-2xl font-black text-rose-600 block mt-1">{stats.cancelledOrders}</span>
              </div>
            </div>
          </div>

        </div>
      ) : null}

    </div>
  );
}
