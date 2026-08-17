"use client";
import { useEffect, useState } from "react";
import { Search, Eye, Filter, Check, X, MessageSquare, Clipboard, ExternalLink, Calendar } from "lucide-react";

export default function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterSearch, setFilterSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // Detail Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/admin/ecourse/courses");
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filterSearch) query.append("search", filterSearch.trim());
      if (filterCourse) query.append("courseId", filterCourse);
      if (filterStatus) query.append("status", filterStatus);
      if (filterStartDate) query.append("startDate", filterStartDate);
      if (filterEndDate) query.append("endDate", filterEndDate);

      const res = await fetch(`/api/admin/ecourse/orders?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchOrders();
  }, []);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleResetFilter = () => {
    setFilterSearch("");
    setFilterCourse("");
    setFilterStatus("");
    setFilterStartDate("");
    setFilterEndDate("");
    setTimeout(() => {
      fetchOrders();
    }, 100);
  };

  const handleOpenDetailModal = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleUpdateOrderStatus = async (id, status) => {
    const statusLabel = status === "PAID" ? "LUNAS (PAID)" : "BATAL (CANCELLED)";
    if (!confirm(`Apakah Anda yakin ingin mengubah status pesanan ini menjadi ${statusLabel}?`)) {
      return;
    }

    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/ecourse/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: status })
      });

      if (res.ok) {
        alert("Status pesanan berhasil diperbarui.");
        setShowDetailModal(false);
        fetchOrders();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal memperbarui status.");
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert(`Order ID "${text}" berhasil disalin ke clipboard.`);
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
      
      {/* 1. Filter Section */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-200/40 bg-white/50 backdrop-blur-md shadow-sm space-y-4">
        <h4 className="font-display text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5"><Filter className="w-4 h-4 text-primary" /> Filter Transaksi</h4>
        
        <form onSubmit={handleApplyFilter} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs font-semibold text-slate-700">
          <div className="space-y-1">
            <label className="text-slate-400 text-[10px] font-bold">Cari Peserta/Order ID</label>
            <input type="text" placeholder="Nama, Email, WA, Order ID..." value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none" />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 text-[10px] font-bold">Pilih Kelas</label>
            <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none bg-white">
              <option value="">Semua Kelas</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 text-[10px] font-bold">Status Pembayaran</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none bg-white">
              <option value="">Semua Status</option>
              <option value="UNPAID">BELUM BAYAR (UNPAID)</option>
              <option value="WAITING_CONFIRMATION">KONFIRMASI WA (WAITING)</option>
              <option value="PAID">LUNAS (PAID)</option>
              <option value="CANCELLED">DIBATALKAN (CANCELLED)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 text-[10px] font-bold">Tanggal Mulai</label>
            <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none bg-white" />
          </div>

          <div className="space-y-1 flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <label className="text-slate-400 text-[10px] font-bold">Tanggal Akhir</label>
              <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none bg-white" />
            </div>
            <div className="flex gap-1">
              <button type="submit" className="px-3.5 py-2 rounded-xl primary-gradient text-white font-bold cursor-pointer transition active:scale-95 shadow"><Search className="w-4 h-4" /></button>
              <button type="button" onClick={handleResetFilter} className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold cursor-pointer transition active:scale-95">Reset</button>
            </div>
          </div>
        </form>
      </div>

      {/* 2. Order Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200/40 bg-white/50 backdrop-blur-md shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 sm:mx-0">
            <table className="w-full text-left text-xs font-semibold text-slate-700 border-collapse min-w-[800px] px-6 sm:px-0">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="py-3 px-4 font-bold">Tanggal</th>
                  <th className="py-3 px-4 font-bold">Order ID</th>
                  <th className="py-3 px-4 font-bold">Peserta</th>
                  <th className="py-3 px-4 font-bold">Kelas</th>
                  <th className="py-3 px-4 font-bold">Total</th>
                  <th className="py-3 px-4 font-bold">Metode</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-400 font-medium">Tidak ada transaksi yang cocok dengan filter.</td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/40 transition">
                      <td className="py-3 px-4 text-slate-500">{new Date(order.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "2-digit" })}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{order.orderCode}</td>
                      <td className="py-3 px-4">
                        <span className="block font-bold">{order.fullName}</span>
                        <span className="block text-[10px] text-slate-400">{order.email}</span>
                      </td>
                      <td className="py-3 px-4 truncate max-w-[150px]">{order.course.title}</td>
                      <td className="py-3 px-4 font-bold">{formatPrice(order.totalAmount)}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase">
                          {order.paymentMethod?.bankName || order.paymentMethod?.type || "Belum Memilih"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          order.paymentStatus === "PAID" ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50" :
                          order.paymentStatus === "WAITING_CONFIRMATION" ? "bg-blue-50 text-blue-700 border border-blue-200/50" :
                          order.paymentStatus === "CANCELLED" ? "bg-rose-50 text-rose-700 border border-rose-200/50" :
                          "bg-amber-50 text-amber-700 border border-amber-200/50"
                        }`}>
                          {order.paymentStatus === "PAID" ? "PAID" :
                           order.paymentStatus === "WAITING_CONFIRMATION" ? "WAITING" :
                           order.paymentStatus === "CANCELLED" ? "CANCELLED" : "UNPAID"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleOpenDetailModal(order)}
                          className="p-1.5 hover:bg-slate-100 hover:text-primary rounded-lg transition active:scale-90 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDetailModal(false)} />
          <div className="bg-white rounded-3xl w-full max-w-[600px] max-h-[85vh] overflow-y-auto p-6 sm:p-8 relative shadow-2xl animate-scale-up space-y-6 text-xs font-semibold text-slate-700">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-display text-base sm:text-lg font-black text-slate-800">Detail Transaksi Order</h3>
                <p className="text-slate-400 text-[10px]">Data pendaftaran kelas dan verifikasi transfer manual.</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 transition"><X className="w-5 h-5" /></button>
            </div>

            {/* Content info panels */}
            <div className="space-y-5">
              
              {/* 1. Data Peserta */}
              <div className="space-y-2">
                <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Identitas Peserta</h4>
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2.5">
                  <div className="flex justify-between"><span className="text-slate-400">Nama Lengkap</span><span className="text-slate-800 font-bold">{selectedOrder.fullName}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Email</span><span className="text-slate-800 font-bold">{selectedOrder.email}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">WhatsApp</span><span className="text-slate-800 font-bold">{selectedOrder.whatsapp}</span></div>
                </div>
              </div>

              {/* 2. Data Kelas */}
              <div className="space-y-2">
                <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Materi Kelas</h4>
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2.5">
                  <div className="flex justify-between"><span className="text-slate-400">Nama Kelas</span><span className="text-slate-800 font-bold">{selectedOrder.course.title}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Mentor</span><span className="text-slate-800 font-bold">{selectedOrder.course.mentorName}</span></div>
                </div>
              </div>

              {/* 3. Data Pembayaran */}
              <div className="space-y-2">
                <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rincian Pembayaran</h4>
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2.5">
                  <div className="flex justify-between"><span className="text-slate-400">Order ID</span><span className="text-slate-800 font-bold select-all">{selectedOrder.orderCode}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Metode</span><span className="text-slate-800 font-bold">{selectedOrder.paymentMethod?.bankName || selectedOrder.paymentMethod?.type || "Belum memilih"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Status</span><span className="font-bold text-slate-800 uppercase">{selectedOrder.paymentStatus}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Total Biaya</span><span className="text-rose-600 font-black text-sm">{formatPrice(selectedOrder.totalAmount)}</span></div>
                  
                  {selectedOrder.confirmedAt && (
                    <div className="flex justify-between border-t border-slate-200/50 pt-2 text-[11px] text-slate-400">
                      <span>Dikonfirmasi Pada</span>
                      <span className="text-slate-500 font-bold">{new Date(selectedOrder.confirmedAt).toLocaleString("id-ID")} oleh {selectedOrder.confirmedBy?.name}</span>
                    </div>
                  )}

                  {selectedOrder.cancelledAt && (
                    <div className="flex justify-between border-t border-slate-200/50 pt-2 text-[11px] text-slate-400">
                      <span>Dibatalkan Pada</span>
                      <span className="text-slate-500 font-bold">{new Date(selectedOrder.cancelledAt).toLocaleString("id-ID")}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Action buttons footer */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2.5 justify-end">
              
              {/* Copy ID */}
              <button
                onClick={() => handleCopy(selectedOrder.orderCode)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer shadow-inner"
              >
                <Clipboard className="w-4 h-4" /> Copy ID
              </button>

              {/* Chat WA */}
              <a
                href={`https://wa.me/${selectedOrder.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl font-bold transition flex items-center gap-1.5 border border-blue-100 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" /> Chat WA
              </a>

              {/* Cancel order */}
              {selectedOrder.paymentStatus !== "CANCELLED" && selectedOrder.paymentStatus !== "PAID" && (
                <button
                  onClick={() => handleUpdateOrderStatus(selectedOrder.id, "CANCELLED")}
                  disabled={updatingStatus}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold transition flex items-center gap-1.5 border border-rose-100 cursor-pointer"
                >
                  <X className="w-4 h-4" /> Batalkan Order
                </button>
              )}

              {/* Confirm payment */}
              {selectedOrder.paymentStatus !== "PAID" && selectedOrder.paymentStatus !== "CANCELLED" && (
                <button
                  onClick={() => handleUpdateOrderStatus(selectedOrder.id, "PAID")}
                  disabled={updatingStatus}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4.5 h-4.5" /> Konfirmasi Lunas
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
