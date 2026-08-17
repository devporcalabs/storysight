"use client";
import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, Save, MessageSquare, CreditCard, Compass } from "lucide-react";

export default function SettingsManagement() {
  const [waSettings, setWaSettings] = useState({ whatsappAdmin: "", whatsappTemplate: "" });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states for Settings
  const [waAdmin, setWaAdmin] = useState("");
  const [waTemplate, setWaTemplate] = useState("");
  const [saveSettingsSubmitting, setSaveSettingsSubmitting] = useState(false);

  // Form states for Payment Methods Modals
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);
  const [showEditMethodModal, setShowEditMethodModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);

  const [methodType, setMethodType] = useState("BANK_TRANSFER");
  const [methodBankName, setMethodBankName] = useState("");
  const [methodAccountNumber, setMethodAccountNumber] = useState("");
  const [methodAccountHolder, setMethodAccountHolder] = useState("");
  const [methodQrisImageUrl, setMethodQrisImageUrl] = useState("");
  const [methodMerchantName, setMethodMerchantName] = useState("");
  const [methodIsActive, setMethodIsActive] = useState(true);
  const [methodSortOrder, setMethodSortOrder] = useState("");

  const [methodSubmitting, setMethodSubmitting] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/ecourse/settings");
      if (res.ok) {
        const data = await res.json();
        setWaSettings(data);
        setWaAdmin(data.whatsappAdmin);
        setWaTemplate(data.whatsappTemplate);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const res = await fetch("/api/admin/ecourse/payments");
      if (res.ok) {
        const data = await res.json();
        setPaymentMethods(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchSettings();
      await fetchPaymentMethods();
      setLoading(false);
    };
    init();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaveSettingsSubmitting(true);
    try {
      const res = await fetch("/api/admin/ecourse/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsappAdmin: waAdmin.trim(),
          whatsappTemplate: waTemplate.trim()
        })
      });
      if (res.ok) {
        alert("Pengaturan WhatsApp berhasil disimpan!");
        fetchSettings();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menyimpan pengaturan.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setSaveSettingsSubmitting(false);
    }
  };

  const handleOpenAddMethodModal = () => {
    setMethodType("BANK_TRANSFER");
    setMethodBankName("");
    setMethodAccountNumber("");
    setMethodAccountHolder("");
    setMethodQrisImageUrl("");
    setMethodMerchantName("");
    setMethodIsActive(true);
    setMethodSortOrder(paymentMethods.length + 1);
    setShowAddMethodModal(true);
  };

  const handleOpenEditMethodModal = (method) => {
    setSelectedMethod(method);
    setMethodType(method.type);
    setMethodBankName(method.bankName || "");
    setMethodAccountNumber(method.accountNumber || "");
    setMethodAccountHolder(method.accountHolder || "");
    setMethodQrisImageUrl(method.qrisImageUrl || "");
    setMethodMerchantName(method.merchantName || "");
    setMethodIsActive(method.isActive);
    setMethodSortOrder(method.sortOrder);
    setShowEditMethodModal(true);
  };

  const handleAddMethodSubmit = async (e) => {
    e.preventDefault();
    setMethodSubmitting(true);
    try {
      const res = await fetch("/api/admin/ecourse/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: methodType,
          bankName: methodType === "BANK_TRANSFER" ? methodBankName : null,
          accountNumber: methodType === "BANK_TRANSFER" ? methodAccountNumber : null,
          accountHolder: methodType === "BANK_TRANSFER" ? methodAccountHolder : null,
          qrisImageUrl: methodType === "QRIS" ? methodQrisImageUrl : null,
          merchantName: methodType === "QRIS" ? methodMerchantName : null,
          isActive: methodIsActive,
          sortOrder: Number(methodSortOrder)
        })
      });
      if (res.ok) {
        alert("Metode pembayaran berhasil ditambahkan!");
        setShowAddMethodModal(false);
        fetchPaymentMethods();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menambahkan metode.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setMethodSubmitting(false);
    }
  };

  const handleEditMethodSubmit = async (e) => {
    e.preventDefault();
    setMethodSubmitting(true);
    try {
      const res = await fetch(`/api/admin/ecourse/payments/${selectedMethod.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: methodType,
          bankName: methodType === "BANK_TRANSFER" ? methodBankName : null,
          accountNumber: methodType === "BANK_TRANSFER" ? methodAccountNumber : null,
          accountHolder: methodType === "BANK_TRANSFER" ? methodAccountHolder : null,
          qrisImageUrl: methodType === "QRIS" ? methodQrisImageUrl : null,
          merchantName: methodType === "QRIS" ? methodMerchantName : null,
          isActive: methodIsActive,
          sortOrder: Number(methodSortOrder)
        })
      });
      if (res.ok) {
        alert("Metode pembayaran berhasil diperbarui!");
        setShowEditMethodModal(false);
        fetchPaymentMethods();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal memperbarui metode.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setMethodSubmitting(false);
    }
  };

  const handleDeleteMethod = async (id, name) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus metode pembayaran "${name}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/ecourse/payments/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        alert("Metode pembayaran berhasil dihapus.");
        fetchPaymentMethods();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus metode.");
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan jaringan.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Left Column: WhatsApp Settings */}
      <div className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/40 bg-white/50 backdrop-blur-md shadow-sm space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <MessageSquare className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-display text-sm sm:text-base font-black text-slate-800">Pengaturan WhatsApp</h3>
            <p className="text-slate-400 text-[10px]">Pesan konfirmasi pembayaran otomatis peserta.</p>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4 text-xs font-semibold text-slate-700">
          <div className="space-y-1.5">
            <label className="block text-slate-500 font-bold">Nomor WhatsApp Admin *</label>
            <input
              type="text"
              required
              placeholder="Contoh: 62895809372277"
              value={waAdmin}
              onChange={(e) => setWaAdmin(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none"
            />
            <span className="text-[10px] text-slate-400 font-medium block">Harus menyertakan kode negara (tanpa simbol + atau spasi, contoh: 628...).</span>
          </div>

          <div className="space-y-1.5">
            <label className="block text-slate-500 font-bold">Template Pesan Konfirmasi *</label>
            <textarea
              rows="8"
              required
              placeholder="Gunakan variabel {orderCode}, {fullName}, {courseTitle}, {totalAmount} untuk kustomisasi pesan..."
              value={waTemplate}
              onChange={(e) => setWaTemplate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none font-sans"
            />
            <div className="space-y-1 pt-1.5 text-[9px] text-slate-400 font-medium leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-500 block">Variabel yang Tersedia:</span>
              <ul className="list-disc list-inside">
                <li><code className="bg-slate-200 px-1 py-0.5 rounded text-[8px] font-mono">{`{orderCode}`}</code>: Kode Order Unik (misal: EC-260817-0012)</li>
                <li><code className="bg-slate-200 px-1 py-0.5 rounded text-[8px] font-mono">{`{fullName}`}</code>: Nama Lengkap Siswa</li>
                <li><code className="bg-slate-200 px-1 py-0.5 rounded text-[8px] font-mono">{`{courseTitle}`}</code>: Judul Kelas E-Course</li>
                <li><code className="bg-slate-200 px-1 py-0.5 rounded text-[8px] font-mono">{`{totalAmount}`}</code>: Total Biaya Transfer</li>
              </ul>
            </div>
          </div>

          <button
            type="submit"
            disabled={saveSettingsSubmitting}
            className="w-full py-3 rounded-full primary-gradient text-white hover:shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 font-black"
          >
            <Save className="w-4.5 h-4.5" />
            {saveSettingsSubmitting ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </form>
      </div>

      {/* Right Column: Payment Methods List */}
      <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/40 bg-white/50 backdrop-blur-md shadow-sm space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-display text-sm sm:text-base font-black text-slate-800">Metode Pembayaran</h3>
              <p className="text-slate-400 text-[10px]">Daftar rekening bank & QRIS statis.</p>
            </div>
          </div>
          <button
            onClick={handleOpenAddMethodModal}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition text-[10px] font-black cursor-pointer shadow-sm border border-primary/10"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Rekening
          </button>
        </div>

        {/* Payment list */}
        <div className="space-y-4">
          {paymentMethods.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-8 font-semibold">Belum ada metode pembayaran yang ditambahkan.</p>
          ) : (
            paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition text-xs font-semibold ${
                  method.isActive ? "bg-white/60 border-slate-200/60" : "bg-slate-50/50 border-slate-100 opacity-60"
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-md font-bold text-[9px] uppercase">{method.type}</span>
                    <h4 className="text-slate-800 font-bold truncate">
                      {method.type === "BANK_TRANSFER" ? `${method.bankName} - ${method.accountNumber}` : `${method.merchantName} (QRIS)`}
                    </h4>
                  </div>
                  <p className="text-slate-400 text-[10px]">
                    {method.type === "BANK_TRANSFER" ? `Pemilik: ${method.accountHolder}` : "QRIS Statis Aktif"} • Urutan: {method.sortOrder}
                  </p>
                </div>

                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => handleOpenEditMethodModal(method)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteMethod(method.id, method.bankName || method.merchantName)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition border border-rose-100 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ADD METHOD MODAL */}
      {showAddMethodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAddMethodModal(false)} />
          <div className="bg-white rounded-3xl w-full max-w-[450px] p-6 sm:p-8 relative shadow-2xl animate-scale-up space-y-6 text-xs font-semibold text-slate-700">
            
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="font-display text-base font-black text-slate-800">Tambah Metode Pembayaran</h3>
              <button onClick={() => setShowAddMethodModal(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 transition"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAddMethodSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-slate-500 font-bold">Tipe Metode *</label>
                <select value={methodType} onChange={(e) => setMethodType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none bg-white">
                  <option value="BANK_TRANSFER">Transfer Bank Manual</option>
                  <option value="QRIS">QRIS Statis</option>
                </select>
              </div>

              {methodType === "BANK_TRANSFER" ? (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Nama Bank (misal: BCA, Mandiri) *</label>
                    <input type="text" required value={methodBankName} onChange={(e) => setMethodBankName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Nomor Rekening *</label>
                    <input type="text" required value={methodAccountNumber} onChange={(e) => setMethodAccountNumber(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Nama Pemilik Rekening *</label>
                    <input type="text" required value={methodAccountHolder} onChange={(e) => setMethodAccountHolder(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none" />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Nama Merchant (misal: StorySight ID) *</label>
                    <input type="text" required value={methodMerchantName} onChange={(e) => setMethodMerchantName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Gambar QRIS URL (R2 / Image link) *</label>
                    <input type="text" required value={methodQrisImageUrl} onChange={(e) => setMethodQrisImageUrl(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none" />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-slate-500 font-bold">Urutan Tampil *</label>
                  <input type="number" required value={methodSortOrder} onChange={(e) => setMethodSortOrder(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none" />
                </div>
                <div className="space-y-1.5 pt-6 flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={methodIsActive} onChange={(e) => setMethodIsActive(e.target.checked)} className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer" />
                    <span className="text-slate-700 font-bold">Aktifkan Metode</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddMethodModal(false)} className="px-4 py-2 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer">Batal</button>
                <button type="submit" disabled={methodSubmitting} className="px-5 py-2 rounded-full primary-gradient text-white hover:shadow transition cursor-pointer">
                  {methodSubmitting ? "Menyimpan..." : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT METHOD MODAL */}
      {showEditMethodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowEditMethodModal(false)} />
          <div className="bg-white rounded-3xl w-full max-w-[450px] p-6 sm:p-8 relative shadow-2xl animate-scale-up space-y-6 text-xs font-semibold text-slate-700">
            
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="font-display text-base font-black text-slate-800">Edit Metode Pembayaran</h3>
              <button onClick={() => setShowEditMethodModal(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 transition"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleEditMethodSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-slate-500 font-bold">Tipe Metode *</label>
                <select value={methodType} onChange={(e) => setMethodType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none bg-white">
                  <option value="BANK_TRANSFER">Transfer Bank Manual</option>
                  <option value="QRIS">QRIS Statis</option>
                </select>
              </div>

              {methodType === "BANK_TRANSFER" ? (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Nama Bank *</label>
                    <input type="text" required value={methodBankName} onChange={(e) => setMethodBankName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Nomor Rekening *</label>
                    <input type="text" required value={methodAccountNumber} onChange={(e) => setMethodAccountNumber(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Nama Pemilik Rekening *</label>
                    <input type="text" required value={methodAccountHolder} onChange={(e) => setMethodAccountHolder(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none" />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Nama Merchant *</label>
                    <input type="text" required value={methodMerchantName} onChange={(e) => setMethodMerchantName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Gambar QRIS URL *</label>
                    <input type="text" required value={methodQrisImageUrl} onChange={(e) => setMethodQrisImageUrl(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none" />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-slate-500 font-bold">Urutan Tampil *</label>
                  <input type="number" required value={methodSortOrder} onChange={(e) => setMethodSortOrder(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none" />
                </div>
                <div className="space-y-1.5 pt-6 flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={methodIsActive} onChange={(e) => setMethodIsActive(e.target.checked)} className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer" />
                    <span className="text-slate-700 font-bold">Aktifkan Metode</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowEditMethodModal(false)} className="px-4 py-2 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer">Batal</button>
                <button type="submit" disabled={methodSubmitting} className="px-5 py-2 rounded-full primary-gradient text-white hover:shadow transition cursor-pointer">
                  {methodSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
