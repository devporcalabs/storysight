"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Copy, Check, MessageSquare, ArrowRight, CornerDownRight, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function PaymentPage() {
  const { orderCode } = useParams();
  const router = useRouter();
  
  const [order, setOrder] = useState(null);
  const [whatsappAdmin, setWhatsappAdmin] = useState("62895809372277");
  const [whatsappTemplate, setWhatsappTemplate] = useState("");
  const [activePaymentMethods, setActivePaymentMethods] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [copiedBankId, setCopiedBankId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await fetch(`/api/course-orders/${orderCode}`);
        if (!res.ok) {
          router.push("/courses");
          return;
        }
        const data = await res.json();
        setOrder(data.order);
        setWhatsappAdmin(data.whatsappAdmin);
        setWhatsappTemplate(data.whatsappTemplate);
        setActivePaymentMethods(data.activePaymentMethods);
      } catch (err) {
        console.error("Error fetching order details:", err);
        router.push("/courses");
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderCode]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedBankId(id);
    setTimeout(() => setCopiedBankId(null), 2000);
  };

  const handleConfirmPayment = async () => {
    setSubmitting(true);
    try {
      // 1. Hit API to set WAITING_CONFIRMATION
      await fetch(`/api/course-orders/${orderCode}/whatsapp-confirmation`, {
        method: "POST"
      });

      // 2. Format the WA message
      const formatPrice = (val) => {
        return new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0
        }).format(val);
      };

      let message = whatsappTemplate || 
        "Halo Admin StorySight,\n\nSaya ingin melakukan konfirmasi pembayaran E-Course.\n\nOrder ID: {orderCode}\nNama: {fullName}\nCourse: {courseTitle}\nTotal: {totalAmount}\n\nSaya akan mengirimkan bukti pembayaran melalui WhatsApp ini.\n\nTerima kasih.";
      
      message = message
        .replace(/{orderCode}/g, order.orderCode)
        .replace(/{fullName}/g, order.fullName)
        .replace(/{courseTitle}/g, order.course.title)
        .replace(/{totalAmount}/g, formatPrice(order.totalAmount));

      // 3. Redirect to WhatsApp API
      const waUrl = `https://wa.me/${whatsappAdmin}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");

      // 4. Redirect user to Order Status success page
      router.push(`/orders/${orderCode}`);
    } catch (err) {
      console.error("WhatsApp confirmation trigger error:", err);
      // Fallback: still redirect to order status page
      router.push(`/orders/${orderCode}`);
    } finally {
      setSubmitting(false);
    }
  };

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

  // Filter payment methods
  const bankAccounts = activePaymentMethods.filter(p => p.type === "BANK_TRANSFER");
  const qrisMethods = activePaymentMethods.filter(p => p.type === "QRIS");

  return (
    <div className="bg-surface mesh-gradient min-h-screen font-sans text-slate-800 flex flex-col">
      <Navbar />

      <main className="max-w-[800px] mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-20 w-full flex-1">
        {/* Payment Main Container */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/40 shadow-xl bg-white/80 backdrop-blur-md space-y-6">
          
          {/* Header Title */}
          <div className="text-center space-y-2 pb-6 border-b border-slate-100">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Menunggu Pembayaran</span>
            <h1 className="font-display text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Instruksi Pembayaran</h1>
            <p className="text-slate-500 text-xs font-semibold">Silakan lakukan transfer sesuai rincian di bawah ini untuk menyelesaikan pendaftaran.</p>
          </div>

          {/* Rincian Transaksi */}
          <div className="bg-slate-50/50 p-4 sm:p-5 rounded-2xl border border-slate-100/50 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
            <div className="space-y-1">
              <span className="text-slate-400 font-bold block">Order ID</span>
              <span className="text-slate-800 font-bold text-sm block">{order.orderCode}</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-bold block">Nama Lengkap</span>
              <span className="text-slate-800 font-bold text-sm block">{order.fullName}</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-bold block">Kelas Yang Didaftar</span>
              <span className="text-slate-800 font-bold text-sm block truncate">{order.course.title}</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-bold block">Total Transfer</span>
              <span className="text-rose-600 font-black text-base sm:text-lg block">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>

          {/* Metode Pembayaran list */}
          <div className="space-y-6 pt-4">
            
            {/* 1. Transfer Bank */}
            {bankAccounts.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-display text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CornerDownRight className="w-4 h-4 text-primary" /> Transfer Rekening Bank
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {bankAccounts.map((bank) => (
                    <div key={bank.id} className="bg-white/40 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between gap-4 shadow-sm">
                      <div className="space-y-2 text-xs font-semibold">
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-md font-bold text-[10px]">{bank.bankName}</span>
                          <span className="text-slate-400 text-[10px]">{bank.accountHolder}</span>
                        </div>
                        <span className="text-slate-800 font-black text-base sm:text-lg block select-all tracking-wider">{bank.accountNumber}</span>
                      </div>
                      
                      <button
                        onClick={() => handleCopy(bank.accountNumber, bank.id)}
                        className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-800 text-[10px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-inner"
                      >
                        {copiedBankId === bank.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" /> Berhasil Disalin
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Salin Nomor Rekening
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. QRIS */}
            {qrisMethods.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="font-display text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CornerDownRight className="w-4 h-4 text-primary" /> Scan QRIS
                </h3>

                {qrisMethods.map((qris) => (
                  <div key={qris.id} className="bg-white/40 p-5 rounded-3xl border border-slate-100 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
                    <div className="w-40 h-40 bg-white p-3 rounded-2xl border border-slate-200 shadow-inner flex items-center justify-center shrink-0">
                      <img src={qris.qrisImageUrl} alt={qris.merchantName} className="w-full h-full object-contain" />
                    </div>
                    <div className="space-y-2 text-center sm:text-left text-xs font-semibold text-slate-600 leading-relaxed">
                      <h4 className="text-slate-800 font-black text-sm">{qris.merchantName}</h4>
                      <p className="text-slate-400 text-[11px] font-medium">Scan QR Code di atas menggunakan aplikasi dompet digital (GoPay, OVO, Dana, LinkAja) atau Mobile Banking Anda.</p>
                      <ul className="space-y-1 pt-2 font-semibold text-slate-500 list-disc list-inside">
                        <li>Simpan screenshot bukti pembayaran</li>
                        <li>Pastikan jumlah nominal transfer tepat</li>
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Konfirmasi Box */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="bg-amber-50/40 border border-amber-100 p-4 rounded-2xl text-[11px] sm:text-xs text-amber-800 font-semibold leading-relaxed flex items-start gap-3">
              <span className="text-sm shrink-0">ℹ️</span>
              <p>
                <strong>PENTING:</strong> Sistem pembayaran kami adalah <strong>Manual</strong>. Anda <strong>wajib</strong> mengirimkan screenshot/foto bukti transfer asli ke WhatsApp Admin melalui tombol di bawah ini agar Admin dapat memverifikasi pembayaran dan memberikan link WhatsApp Group.
              </p>
            </div>

            <button
              onClick={handleConfirmPayment}
              disabled={submitting}
              className="w-full py-4 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white hover:shadow-lg text-xs sm:text-sm font-black shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageSquare className="w-4.5 h-4.5 shrink-0" />
              {submitting ? "Memproses..." : "Konfirmasi Pembayaran via WhatsApp"}
            </button>

            <Link
              href={`/orders/${order.orderCode}`}
              className="w-full py-3.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition text-center cursor-pointer flex items-center justify-center gap-1.5"
            >
              Saya sudah melakukan konfirmasi WhatsApp <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </main>

      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} StorySight. All rights reserved.
      </footer>
    </div>
  );
}
