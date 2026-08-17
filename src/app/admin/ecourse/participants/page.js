"use client";
import { useEffect, useState } from "react";
import { Search, MessageSquare, Clipboard, ExternalLink, Download, FileText } from "lucide-react";

export default function ParticipantsManagement() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      // Participants are paid orders
      const res = await fetch("/api/admin/ecourse/orders?status=PAID");
      if (res.ok) {
        const data = await res.json();
        setParticipants(data);
      }
    } catch (err) {
      console.error("Error fetching participants:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    alert(`${type} "${text}" berhasil disalin.`);
  };

  // Export to CSV Function
  const handleExportCSV = () => {
    if (participants.length === 0) {
      alert("Tidak ada data peserta untuk di-export.");
      return;
    }

    // CSV Headers
    const headers = ["Order ID", "Nama Lengkap", "Email", "WhatsApp", "Kelas E-Course", "Tanggal Konfirmasi Lunas", "Nilai Transaksi"];
    
    // CSV Rows
    const rows = participants.map(p => [
      p.orderCode,
      p.fullName,
      p.email,
      `'${p.whatsapp}`, // Single quote prefix to prevent Excel dropping leading zeros
      p.course.title,
      p.confirmedAt ? new Date(p.confirmedAt).toLocaleDateString("id-ID") : "-",
      p.totalAmount
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `storysight_ecourse_participants_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredParticipants = participants.filter(p => {
    const s = search.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(s) ||
      p.email.toLowerCase().includes(s) ||
      p.whatsapp.includes(s) ||
      p.course.title.toLowerCase().includes(s) ||
      p.orderCode.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Search and Export Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
        {/* Search input */}
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Cari nama, email, WA, kelas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-xs font-semibold text-slate-700 bg-white/50 backdrop-blur-md"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>

        {/* Export CSV Button */}
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/50 hover:shadow text-xs font-bold transition cursor-pointer"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>

      </div>

      {/* Participants Table Card */}
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
                  <th className="py-3 px-4 font-bold">Nama Peserta</th>
                  <th className="py-3 px-4 font-bold">Email</th>
                  <th className="py-3 px-4 font-bold">WhatsApp</th>
                  <th className="py-3 px-4 font-bold">Kelas E-Course</th>
                  <th className="py-3 px-4 font-bold">Order ID</th>
                  <th className="py-3 px-4 font-bold">Tanggal Daftar</th>
                  <th className="py-3 px-4 font-bold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {filteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400 font-medium">Belum ada peserta aktif (lunas) yang terdaftar.</td>
                  </tr>
                ) : (
                  filteredParticipants.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/40 transition text-slate-700">
                      <td className="py-3 px-4 font-bold text-slate-850">{p.fullName}</td>
                      <td className="py-3 px-4 truncate max-w-[120px]">
                        <span className="cursor-pointer hover:underline text-primary" onClick={() => handleCopy(p.email, "Email")}>{p.email}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="cursor-pointer hover:underline text-primary" onClick={() => handleCopy(p.whatsapp, "No WA")}>{p.whatsapp}</span>
                      </td>
                      <td className="py-3 px-4 truncate max-w-[160px]">{p.course.title}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono">{p.orderCode}</td>
                      <td className="py-3 px-4 text-slate-500">
                        {p.confirmedAt ? new Date(p.confirmedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "2-digit" }) : "-"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex gap-1.5">
                          {/* Chat WA */}
                          <a
                            href={`https://wa.me/${p.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition active:scale-90"
                            title="Chat WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>

                          {/* Open WhatsApp Group Link */}
                          <a
                            href={p.course.whatsappGroupUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition active:scale-90"
                            title="Buka Link WhatsApp Group Kelas"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
