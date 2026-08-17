"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Clock, CheckCircle2, AlertCircle, XCircle, ExternalLink, ArrowLeft, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function OrderStatusPage() {
  const { orderCode } = useParams();
  const router = useRouter();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrderDetails = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);
    try {
      const res = await fetch(`/api/course-orders/${orderCode}`);
      if (!res.ok) {
        router.push("/courses");
        return;
      }
      const data = await res.json();
      setOrder(data.order);
    } catch (err) {
      console.error("Error fetching order status:", err);
      router.push("/courses");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderCode]);

  if (loading) {
    return (
      <div className="bg-surface mesh-gradient min-h-screen font-sans flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
        </main>
      </div>
    );
  }

  if (!order) return null;

  const formatPrice = (val) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const status = order.paymentStatus; // "UNPAID", "WAITING_CONFIRMATION", "PAID", "CANCELLED"

  return (
    <div className="bg-surface mesh-gradient min-h-screen font-sans text-slate-800 flex flex-col">
      <Navbar />

      <main className="max-w-[700px] mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-20 w-full flex-1">
        {/* Back link */}
        <div className="w-full mb-6 flex justify-between items-center">
          <Link
            href="/courses"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Kembali ke Katalog
          </Link>

          <button
            onClick={() => fetchOrderDetails(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Perbarui Status
          </button>
        </div>

        {/* Status Box */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/40 shadow-xl bg-white/80 backdrop-blur-md space-y-6">
          
          {/* Status Indicator Icon & Title */}
          <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-slate-100">
            {status === "UNPAID" && (
              <>
                <AlertCircle className="w-16 h-16 text-amber-500" />
                <h1 className="font-display text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Belum Melakukan Konfirmasi</h1>
                <p className="text-slate-400 text-xs font-semibold max-w-sm">Anda telah mendaftar, namun belum mengirimkan konfirmasi pembayaran ke WhatsApp Admin.</p>
              </>
            )}

            {status === "WAITING_CONFIRMATION" && (
              <>
                <Clock className="w-16 h-16 text-blue-500 animate-pulse" />
                <h1 className="font-display text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Menunggu Verifikasi</h1>
                <p className="text-slate-400 text-xs font-semibold max-w-sm">Bukti pembayaran Anda sedang diverifikasi secara manual oleh administrator kami.</p>
              </>
            )}

            {status === "PAID" && (
              <>
                <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                <h1 className="font-display text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Pembayaran Sukses!</h1>
                <p className="text-slate-400 text-xs font-semibold max-w-sm">Pembayaran Anda telah dikonfirmasi. Selamat belajar!</p>
              </>
            )}

            {status === "CANCELLED" && (
              <>
                <XCircle className="w-16 h-16 text-rose-500" />
                <h1 className="font-display text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Order Dibatalkan</h1>
                <p className="text-slate-400 text-xs font-semibold max-w-sm">Pendaftaran E-Course untuk pesanan ini telah dibatalkan oleh admin.</p>
              </>
            )}
          </div>

          {/* Rincian Transaksi */}
          <div className="space-y-4">
            <h3 className="font-display text-xs font-bold text-slate-400 uppercase tracking-wider">Rincian Pesanan</h3>
            
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 space-y-3 text-xs font-semibold text-slate-600">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Order ID</span>
                <span className="text-slate-800 font-bold">{order.orderCode}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Nama Lengkap</span>
                <span className="text-slate-800 font-bold">{order.fullName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Kelas E-Course</span>
                <span className="text-slate-800 font-bold max-w-[200px] sm:max-w-none truncate">{order.course.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Biaya</span>
                <span className="text-slate-800 font-black">{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200/50">
                <span className="text-slate-400">Status Pembayaran</span>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                  status === "PAID" ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50" :
                  status === "WAITING_CONFIRMATION" ? "bg-blue-50 text-blue-700 border border-blue-200/50" :
                  status === "CANCELLED" ? "bg-rose-50 text-rose-700 border border-rose-200/50" :
                  "bg-amber-50 text-amber-700 border border-amber-200/50"
                }`}>
                  {status === "PAID" ? "SUKSES / LUNAS" :
                   status === "WAITING_CONFIRMATION" ? "MENUNGGU KONFIRMASI" :
                   status === "CANCELLED" ? "DIBATALKAN" : "BELUM BAYAR"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button sesuai status */}
          <div className="pt-6 border-t border-slate-100">
            {status === "UNPAID" && (
              <Link
                href={`/orders/${order.orderCode}/payment`}
                className="w-full py-4 rounded-full primary-gradient text-white hover:shadow-lg text-xs sm:text-sm font-black shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Bayar Sekarang
              </Link>
            )}

            {status === "WAITING_CONFIRMATION" && (
              <div className="bg-slate-100 text-slate-500 p-4 rounded-2xl text-[11px] sm:text-xs font-semibold leading-relaxed text-center">
                Admin sedang memverifikasi pembayaran Anda. Anda akan mendapatkan tautan WhatsApp Group di halaman ini setelah status berubah menjadi Lunas. Silakan lakukan penyegaran (*refresh*) halaman ini berkala.
              </div>
            )}

            {status === "PAID" && (
              <div className="space-y-4">
                <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl text-[11px] sm:text-xs text-emerald-800 font-semibold leading-relaxed text-center">
                  Pembayaran berhasil divalidasi! Silakan bergabung ke WhatsApp Group kelas di bawah ini untuk memulai pembelajaran.
                </div>
                <a
                  href={order.course.whatsappGroupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white hover:shadow-lg text-xs sm:text-sm font-black shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  Join WhatsApp Group <ExternalLink className="w-4 h-4 shrink-0" />
                </a>
              </div>
            )}

            {status === "CANCELLED" && (
              <div className="bg-slate-100 text-slate-500 p-4 rounded-2xl text-[11px] sm:text-xs font-semibold leading-relaxed text-center">
                Transaksi ini telah dibatalkan. Jika menurut Anda ini adalah kekeliruan, silakan hubungi administrator StorySight.
              </div>
            )}
          </div>

        </div>
      </main>

      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} StorySight. All rights reserved.
      </footer>
    </div>
  );
}
