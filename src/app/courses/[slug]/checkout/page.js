"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Lock, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function CheckoutPage() {
  const { slug } = useParams();
  const router = useRouter();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [agree, setAgree] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/courses/${slug}`);
        if (!res.ok) {
          router.push("/courses");
          return;
        }
        const data = await res.json();
        if (data.status === "CLOSED" || data.isFull) {
          router.push(`/courses/${slug}`);
          return;
        }
        setCourse(data);
      } catch (err) {
        console.error("Error fetching course for checkout:", err);
        router.push("/courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName.trim() || !email.trim() || !whatsapp.trim()) {
      setErrorMsg("Semua kolom data diri wajib diisi.");
      return;
    }

    if (!agree) {
      setErrorMsg("Anda harus menyetujui pernyataan kebenaran data.");
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Format alamat email tidak valid.");
      return;
    }

    // Basic WA number format validation
    const waDigits = whatsapp.replace(/\D/g, "");
    if (waDigits.length < 9) {
      setErrorMsg("Nomor WhatsApp tidak valid (terlalu pendek).");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/course-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          fullName: fullName.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim()
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Success: redirect to payment page
        router.push(`/orders/${data.orderCode}/payment`);
      } else {
        setErrorMsg(data.error || "Gagal melakukan pendaftaran. Silakan coba lagi.");
      }
    } catch (err) {
      console.error("Submit checkout error:", err);
      setErrorMsg("Terjadi kesalahan koneksi. Silakan coba kembali.");
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

  if (!course) return null;

  const normalPrice = course.price;
  const promoPrice = course.discountPrice;
  const hasPromo = promoPrice !== null && promoPrice < normalPrice;
  const finalPrice = hasPromo ? promoPrice : normalPrice;

  const formatPrice = (val) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="bg-surface mesh-gradient min-h-screen font-sans text-slate-800 flex flex-col">
      <Navbar />

      <main className="max-w-[1000px] mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-20 w-full flex-1">
        {/* Back Link */}
        <div className="w-full mb-6">
          <Link
            href={`/courses/${course.slug}`}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Kembali ke Detail Kelas
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form checkout */}
          <div className="md:col-span-7 space-y-6">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/40 shadow-xl bg-white/80 backdrop-blur-md space-y-6">
              <div className="space-y-1.5">
                <h1 className="font-display text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Formulir Pendaftaran</h1>
                <p className="text-slate-500 text-xs">Lengkapi data diri Anda di bawah ini. Akun belajar e-course tidak memerlukan login.</p>
              </div>

              {errorMsg && (
                <div className="p-4 bg-rose-50 text-[#e11d48] text-xs font-bold rounded-2xl border border-rose-100 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
                <div className="space-y-1.5">
                  <label htmlFor="fullName" className="block text-slate-500 font-bold">Nama Lengkap *</label>
                  <input
                    type="text"
                    id="fullName"
                    required
                    placeholder="Masukkan nama lengkap sesuai sertifikat"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition bg-white/50 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-slate-500 font-bold">Alamat Email Aktif *</label>
                  <input
                    type="email"
                    id="email"
                    required
                    placeholder="contoh@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition bg-white/50 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="whatsapp" className="block text-slate-500 font-bold">Nomor WhatsApp Aktif *</label>
                  <input
                    type="tel"
                    id="whatsapp"
                    required
                    placeholder="Contoh: 08123456789"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition bg-white/50 text-xs font-semibold"
                  />
                  <span className="text-[10px] text-slate-400 font-medium block">Nomor ini digunakan untuk verifikasi kuitansi pembayaran & mengirimkan akses WA Group.</span>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer w-4 h-4"
                    />
                    <span className="text-[11px] text-slate-600 font-bold leading-relaxed">
                      Saya memastikan seluruh data yang saya masukkan sudah benar dan sesuai.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-4 py-3.5 rounded-full primary-gradient text-white hover:shadow-lg text-xs sm:text-sm font-black shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CreditCard className="w-4 h-4" />
                  {submitting ? "Memproses..." : "Lanjutkan Pembayaran"}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="md:col-span-5 space-y-6">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/40 shadow-sm bg-white/60 backdrop-blur-md space-y-6">
              <h3 className="font-display text-sm font-bold text-slate-800 uppercase tracking-wider">Ringkasan Pendaftaran</h3>
              
              <div className="flex gap-3">
                <div className="w-20 h-14 rounded-xl overflow-hidden bg-slate-100 shadow-sm shrink-0">
                  <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <h4 className="text-slate-800 font-bold text-xs sm:text-sm truncate">{course.title}</h4>
                  <p className="text-slate-500 text-[10px] truncate">Mentor: {course.mentorName}</p>
                  <p className="text-slate-400 text-[10px] truncate">Jadwal: {new Date(course.startDate).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}</p>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span>Harga Normal</span>
                  <span>{formatPrice(normalPrice)}</span>
                </div>
                
                {hasPromo && (
                  <div className="flex justify-between text-rose-600">
                    <span>Diskon Kelas</span>
                    <span>-{formatPrice(course.price - course.discountPrice)}</span>
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t border-slate-100 text-slate-800 text-sm font-black">
                  <span>Total Bayar</span>
                  <span>{formatPrice(finalPrice)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5 text-[10px] text-slate-400 font-medium leading-relaxed">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-300" />
                  <span>Sistem Enkripsi Sesi Sederhana & Aman</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-300" />
                  <span>Keanggotaan grup otomatis setelah divalidasi admin</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} StorySight. All rights reserved.
      </footer>
    </div>
  );
}
