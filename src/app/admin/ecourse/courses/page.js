"use client";
import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, PlusCircle, MinusCircle, Eye, EyeOff, Calendar, Lock } from "lucide-react";

export default function CoursesManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formThumbnailUrl, setFormThumbnailUrl] = useState("");
  const [formShortDescription, setFormShortDescription] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formMentorName, setFormMentorName] = useState("");
  const [formMentorPhotoUrl, setFormMentorPhotoUrl] = useState("");
  const [formMentorBio, setFormMentorBio] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formDiscountPrice, setFormDiscountPrice] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formDuration, setFormDuration] = useState("");
  const [formQuota, setFormQuota] = useState("");
  const [formWhatsappGroupUrl, setFormWhatsappGroupUrl] = useState("");
  const [formStatus, setFormStatus] = useState("DRAFT");
  const [formIsFeatured, setFormIsFeatured] = useState(false);

  // Array states for nested models
  const [formOutcomes, setFormOutcomes] = useState([""]);
  const [formBenefits, setFormBenefits] = useState([""]);

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/admin/ecourse/courses");
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (err) {
      console.error("Error loading admin courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Sync Slug automatically with Title during Add
  useEffect(() => {
    if (showAddModal) {
      const generated = formTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setFormSlug(generated);
    }
  }, [formTitle, showAddModal]);

  const handleOpenAddModal = () => {
    setFormTitle("");
    setFormSlug("");
    setFormThumbnailUrl("");
    setFormShortDescription("");
    setFormDescription("");
    setFormMentorName("");
    setFormMentorPhotoUrl("");
    setFormMentorBio("");
    setFormPrice("");
    setFormDiscountPrice("");
    setFormStartDate("");
    setFormEndDate("");
    setFormDuration("");
    setFormQuota("");
    setFormWhatsappGroupUrl("");
    setFormStatus("DRAFT");
    setFormIsFeatured(false);
    setFormOutcomes([""]);
    setFormBenefits([""]);
    setErrorMsg("");
    setSuccessMsg("");
    setShowAddModal(true);
  };

  const handleOpenEditModal = async (course) => {
    setSelectedCourse(course);
    setFormTitle(course.title);
    setFormSlug(course.slug);
    setFormThumbnailUrl(course.thumbnailUrl);
    setFormShortDescription(course.shortDescription);
    setFormDescription(course.description);
    setFormMentorName(course.mentorName);
    setFormMentorPhotoUrl(course.mentorPhotoUrl);
    setFormMentorBio(course.mentorBio);
    setFormPrice(course.price);
    setFormDiscountPrice(course.discountPrice || "");
    setFormStartDate(new Date(course.startDate).toISOString().split('T')[0]);
    setFormEndDate(new Date(course.endDate).toISOString().split('T')[0]);
    setFormDuration(course.duration);
    setFormQuota(course.quota);
    setFormWhatsappGroupUrl(course.whatsappGroupUrl);
    setFormStatus(course.status);
    setFormIsFeatured(course.isFeatured);

    // Fetch details to get outcomes and benefits
    try {
      const res = await fetch(`/api/admin/ecourse/courses/${course.id}`);
      if (res.ok) {
        const fullData = await res.json();
        setFormOutcomes(fullData.learningOutcomes?.map(o => o.title) || [""]);
        setFormBenefits(fullData.benefits?.map(b => b.title) || [""]);
      }
    } catch (e) {
      console.error(e);
      setFormOutcomes([""]);
      setFormBenefits([""]);
    }

    setErrorMsg("");
    setSuccessMsg("");
    setShowEditModal(true);
  };

  const handleAddOutcomeField = () => setFormOutcomes([...formOutcomes, ""]);
  const handleRemoveOutcomeField = (index) => {
    const next = [...formOutcomes];
    next.splice(index, 1);
    setFormOutcomes(next.length === 0 ? [""] : next);
  };
  const handleOutcomeChange = (index, value) => {
    const next = [...formOutcomes];
    next[index] = value;
    setFormOutcomes(next);
  };

  const handleAddBenefitField = () => setFormBenefits([...formBenefits, ""]);
  const handleRemoveBenefitField = (index) => {
    const next = [...formBenefits];
    next.splice(index, 1);
    setFormBenefits(next.length === 0 ? [""] : next);
  };
  const handleBenefitChange = (index, value) => {
    const next = [...formBenefits];
    next[index] = value;
    setFormBenefits(next);
  };

  const handleAddCourseSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setFormSubmitting(true);

    const outcomesList = formOutcomes.filter(o => o.trim() !== "");
    const benefitsList = formBenefits.filter(b => b.trim() !== "");

    try {
      const res = await fetch("/api/admin/ecourse/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle.trim(),
          slug: formSlug.trim(),
          thumbnailUrl: formThumbnailUrl.trim(),
          shortDescription: formShortDescription.trim(),
          description: formDescription.trim(),
          mentorName: formMentorName.trim(),
          mentorPhotoUrl: formMentorPhotoUrl.trim(),
          mentorBio: formMentorBio.trim(),
          price: Number(formPrice),
          discountPrice: formDiscountPrice ? Number(formDiscountPrice) : null,
          startDate: formStartDate,
          endDate: formEndDate,
          duration: formDuration.trim(),
          quota: Number(formQuota),
          whatsappGroupUrl: formWhatsappGroupUrl.trim(),
          status: formStatus,
          isFeatured: formIsFeatured,
          learningOutcomes: outcomesList,
          benefits: benefitsList
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Kelas berhasil dibuat!");
        setTimeout(() => {
          setShowAddModal(false);
          fetchCourses();
        }, 1200);
      } else {
        setErrorMsg(data.error || "Gagal membuat kelas.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditCourseSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setFormSubmitting(true);

    const outcomesList = formOutcomes.filter(o => o.trim() !== "");
    const benefitsList = formBenefits.filter(b => b.trim() !== "");

    try {
      const res = await fetch(`/api/admin/ecourse/courses/${selectedCourse.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle.trim(),
          slug: formSlug.trim(),
          thumbnailUrl: formThumbnailUrl.trim(),
          shortDescription: formShortDescription.trim(),
          description: formDescription.trim(),
          mentorName: formMentorName.trim(),
          mentorPhotoUrl: formMentorPhotoUrl.trim(),
          mentorBio: formMentorBio.trim(),
          price: Number(formPrice),
          discountPrice: formDiscountPrice ? Number(formDiscountPrice) : null,
          startDate: formStartDate,
          endDate: formEndDate,
          duration: formDuration.trim(),
          quota: Number(formQuota),
          whatsappGroupUrl: formWhatsappGroupUrl.trim(),
          status: formStatus,
          isFeatured: formIsFeatured,
          learningOutcomes: outcomesList,
          benefits: benefitsList
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Data kelas berhasil diperbarui!");
        setTimeout(() => {
          setShowEditModal(false);
          fetchCourses();
        }, 1200);
      } else {
        setErrorMsg(data.error || "Gagal memperbarui kelas.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteCourse = async (id, title) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kelas "${title}"?\nSeluruh data pendaftaran dan kuis kelas ini juga akan terhapus!`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/ecourse/courses/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        alert("Kelas berhasil dihapus.");
        fetchCourses();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus kelas.");
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan koneksi.");
    }
  };

  const formatPrice = (val) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Add button */}
      <div className="flex justify-between items-center">
        <h3 className="font-display text-sm font-bold text-slate-800 uppercase tracking-wider">Daftar Kelas E-Course</h3>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl primary-gradient text-white hover:shadow-lg text-xs font-black shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Tambah Kelas
        </button>
      </div>

      {/* Course List Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length === 0 ? (
          <div className="col-span-full glass-panel p-16 text-center rounded-3xl border border-slate-200/40 bg-white/50">
            <p className="text-slate-400 text-xs font-semibold">Belum ada kelas e-course yang dibuat.</p>
          </div>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="glass-panel rounded-2xl overflow-hidden border border-slate-200/40 bg-white/50 backdrop-blur-md flex flex-col justify-between shadow-sm">
              <div>
                <div className="relative aspect-video w-full bg-slate-100 border-b border-slate-100">
                  <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                  <span className={`absolute top-4 right-4 px-2 py-0.5 rounded-lg text-[9px] font-black tracking-wide ${
                    course.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700 border border-emerald-200/40" :
                    course.status === "CLOSED" ? "bg-rose-100 text-rose-700 border border-rose-200/40" :
                    "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}>
                    {course.status}
                  </span>
                </div>

                <div className="p-5 space-y-3">
                  <h4 className="text-slate-800 font-bold text-sm sm:text-base line-clamp-1">{course.title}</h4>
                  <p className="text-slate-400 text-[10px] sm:text-xs leading-relaxed line-clamp-2">{course.shortDescription}</p>

                  <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-semibold space-y-1.5">
                    <div className="flex justify-between">
                      <span>Harga</span>
                      <span className="text-slate-800 font-black">
                        {course.discountPrice ? (
                          <>
                            <span className="line-through text-slate-300 text-[10px] mr-1">{formatPrice(course.price)}</span>
                            <span className="text-rose-600">{formatPrice(course.discountPrice)}</span>
                          </>
                        ) : (
                          formatPrice(course.price)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kuota Terisi</span>
                      <span className="text-slate-800 font-black">{course._count?.orders || 0} / {course.quota} Kursi</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mulai</span>
                      <span>{new Date(course.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 flex gap-2 border-t border-slate-100/50 mt-4">
                <button
                  onClick={() => handleOpenEditModal(course)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-inner"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Kelas
                </button>
                <button
                  onClick={() => handleDeleteCourse(course.id, course.title)}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[10px] font-bold transition flex items-center justify-center cursor-pointer border border-rose-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="bg-white rounded-3xl w-full max-w-[850px] max-h-[85vh] overflow-y-auto p-6 sm:p-8 relative shadow-2xl animate-scale-up space-y-6 text-xs font-semibold text-slate-700">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-display text-base sm:text-lg font-black text-slate-800">Tambah Kelas E-Course Baru</h3>
                <p className="text-slate-400 text-[10px]">Isi seluruh detail metadata kelas di bawah ini.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 transition"><X className="w-5 h-5" /></button>
            </div>

            {errorMsg && <div className="p-3.5 bg-rose-50 border border-rose-100 text-[#e11d48] font-bold rounded-xl">{errorMsg}</div>}

            <form onSubmit={handleAddCourseSubmit} className="space-y-6">
              
              {/* 1. Basic Info Section */}
              <div className="space-y-4">
                <h4 className="text-[11px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 pb-1.5">1. Informasi Utama</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Judul Kelas *</label>
                    <input type="text" required placeholder="Contoh: English Speaking Bootcamp for Kids" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Slug Kelas *</label>
                    <input type="text" required placeholder="generated-slug-here" value={formSlug} onChange={(e) => setFormSlug(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Thumbnail URL (R2 / Image Link)</label>
                    <input type="text" placeholder="https://images.unsplash.com/... atau /uploads/..." value={formThumbnailUrl} onChange={(e) => setFormThumbnailUrl(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Status Registrasi *</label>
                    <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition bg-white">
                      <option value="DRAFT">DRAFT (Sembunyi)</option>
                      <option value="PUBLISHED">PUBLISHED (Aktif)</option>
                      <option value="CLOSED">CLOSED (Ditutup)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-500 font-bold">Deskripsi Singkat *</label>
                  <input type="text" required placeholder="Deskripsi pendek untuk kartu catalog" value={formShortDescription} onChange={(e) => setFormShortDescription(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-500 font-bold">Deskripsi Lengkap *</label>
                  <textarea rows="4" required placeholder="Deskripsi lengkap mengenai silabus, target, dan konten pembelajaran..." value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
                </div>
              </div>

              {/* 2. Mentor Info Section */}
              <div className="space-y-4">
                <h4 className="text-[11px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 pb-1.5">2. Informasi Mentor</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Nama Mentor *</label>
                    <input type="text" required placeholder="Contoh: Ms. Jane Doe, B.Ed." value={formMentorName} onChange={(e) => setFormMentorName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Foto Mentor URL</label>
                    <input type="text" placeholder="/uploads/..." value={formMentorPhotoUrl} onChange={(e) => setFormMentorPhotoUrl(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-slate-500 font-bold">Bio Mentor Singkat</label>
                  <input type="text" placeholder="Gelar akademik, sertifikat, atau ringkasan portofolio mentor..." value={formMentorBio} onChange={(e) => setFormMentorBio(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
                </div>
              </div>

              {/* 3. Pricing, Quota & Schedules */}
              <div className="space-y-4">
                <h4 className="text-[11px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 pb-1.5">3. Biaya, Jadwal, & Kuota</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Harga Normal *</label>
                    <input type="number" required placeholder="Contoh: 350000" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Harga Diskon (Opsional)</label>
                    <input type="number" placeholder="Contoh: 299000" value={formDiscountPrice} onChange={(e) => setFormDiscountPrice(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Kuota Siswa (Kursi) *</label>
                    <input type="number" required placeholder="Contoh: 25" value={formQuota} onChange={(e) => setFormQuota(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Tanggal Mulai Kelas *</label>
                    <input type="date" required value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition bg-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Tanggal Selesai Kelas *</label>
                    <input type="date" required value={formEndDate} onChange={(e) => setFormEndDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition bg-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Label Durasi *</label>
                    <input type="text" required placeholder="Contoh: 4 Minggu / 1 Bulan" value={formDuration} onChange={(e) => setFormDuration(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Tautan Grup WhatsApp Kelas *</label>
                    <input type="url" required placeholder="https://chat.whatsapp.com/..." value={formWhatsappGroupUrl} onChange={(e) => setFormWhatsappGroupUrl(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
                    <span className="text-[9px] text-slate-400 font-medium block">Tautan ini hanya akan diberikan kepada siswa yang status ordernya LUNAS (PAID).</span>
                  </div>
                  <div className="space-y-1.5 pt-6 flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" checked={formIsFeatured} onChange={(e) => setFormIsFeatured(e.target.checked)} className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer" />
                      <span className="text-slate-700 font-bold">Tandai Kelas Ini Sebagai Terpopuler (Featured)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 4. Outcomes (Poin Pembelajaran) */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                  <h4 className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">4. Poin Hasil Belajar (Outcomes)</h4>
                  <button type="button" onClick={handleAddOutcomeField} className="text-primary hover:text-primary-container text-[10px] font-bold flex items-center gap-1"><PlusCircle className="w-4 h-4" /> Tambah Poin</button>
                </div>
                
                <div className="space-y-2">
                  {formOutcomes.map((outcome, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input type="text" placeholder={`Poin Hasil Belajar #${idx + 1}`} value={outcome} onChange={(e) => handleOutcomeChange(idx, e.target.value)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none bg-slate-50/50" />
                      <button type="button" onClick={() => handleRemoveOutcomeField(idx)} className="text-rose-500 hover:text-rose-600"><MinusCircle className="w-4.5 h-4.5" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Benefits (Fasilitas Kelas) */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                  <h4 className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">5. Fasilitas Kelas (Benefits)</h4>
                  <button type="button" onClick={handleAddBenefitField} className="text-primary hover:text-primary-container text-[10px] font-bold flex items-center gap-1"><PlusCircle className="w-4 h-4" /> Tambah Fasilitas</button>
                </div>
                
                <div className="space-y-2">
                  {formBenefits.map((benefit, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input type="text" placeholder={`Fasilitas Kelas #${idx + 1}`} value={benefit} onChange={(e) => handleBenefitChange(idx, e.target.value)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none bg-slate-50/50" />
                      <button type="button" onClick={() => handleRemoveBenefitField(idx)} className="text-rose-500 hover:text-rose-600"><MinusCircle className="w-4.5 h-4.5" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit / Batal Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 transition cursor-pointer">Batal</button>
                <button type="submit" disabled={formSubmitting} className="px-6 py-2.5 rounded-full primary-gradient text-white hover:shadow-lg transition cursor-pointer shadow-md disabled:opacity-50">
                  {formSubmitting ? "Menyimpan..." : "Simpan Kelas"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="bg-white rounded-3xl w-full max-w-[850px] max-h-[85vh] overflow-y-auto p-6 sm:p-8 relative shadow-2xl animate-scale-up space-y-6 text-xs font-semibold text-slate-700">
            
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-display text-base sm:text-lg font-black text-slate-800">Edit Kelas E-Course</h3>
                <p className="text-slate-400 text-[10px]">Ubah data metadata kelas di bawah ini.</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 transition"><X className="w-5 h-5" /></button>
            </div>

            {errorMsg && <div className="p-3.5 bg-rose-50 border border-rose-100 text-[#e11d48] font-bold rounded-xl">{errorMsg}</div>}
            {successMsg && <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 font-bold rounded-xl">{successMsg}</div>}

            <form onSubmit={handleEditCourseSubmit} className="space-y-6">
              
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="text-[11px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 pb-1.5">1. Informasi Utama</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Judul Kelas *</label>
                    <input type="text" required placeholder="Contoh: English Speaking Bootcamp for Kids" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Slug Kelas *</label>
                    <input type="text" required placeholder="generated-slug-here" value={formSlug} onChange={(e) => setFormSlug(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Thumbnail URL</label>
                    <input type="text" placeholder="/uploads/..." value={formThumbnailUrl} onChange={(e) => setFormThumbnailUrl(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Status Registrasi *</label>
                    <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none bg-white">
                      <option value="DRAFT">DRAFT (Sembunyi)</option>
                      <option value="PUBLISHED">PUBLISHED (Aktif)</option>
                      <option value="CLOSED">CLOSED (Ditutup)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-500 font-bold">Deskripsi Singkat *</label>
                  <input type="text" required placeholder="Deskripsi pendek untuk kartu catalog" value={formShortDescription} onChange={(e) => setFormShortDescription(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-500 font-bold">Deskripsi Lengkap *</label>
                  <textarea rows="4" required placeholder="Deskripsi lengkap..." value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none" />
                </div>
              </div>

              {/* Mentor */}
              <div className="space-y-4">
                <h4 className="text-[11px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 pb-1.5">2. Informasi Mentor</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Nama Mentor *</label>
                    <input type="text" required placeholder="Ms. Jane Doe" value={formMentorName} onChange={(e) => setFormMentorName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Foto Mentor URL</label>
                    <input type="text" placeholder="/uploads/..." value={formMentorPhotoUrl} onChange={(e) => setFormMentorPhotoUrl(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-slate-500 font-bold">Bio Mentor Singkat</label>
                  <input type="text" placeholder="Bio mentor..." value={formMentorBio} onChange={(e) => setFormMentorBio(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none" />
                </div>
              </div>

              {/* Pricing, Quota & Schedules */}
              <div className="space-y-4">
                <h4 className="text-[11px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 pb-1.5">3. Biaya, Jadwal, & Kuota</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Harga Normal *</label>
                    <input type="number" required placeholder="350000" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Harga Diskon (Opsional)</label>
                    <input type="number" placeholder="299000" value={formDiscountPrice} onChange={(e) => setFormDiscountPrice(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Kuota Siswa (Kursi) *</label>
                    <input type="number" required placeholder="25" value={formQuota} onChange={(e) => setFormQuota(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Tanggal Mulai Kelas *</label>
                    <input type="date" required value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none bg-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Tanggal Selesai Kelas *</label>
                    <input type="date" required value={formEndDate} onChange={(e) => setFormEndDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none bg-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Label Durasi *</label>
                    <input type="text" required placeholder="4 Minggu" value={formDuration} onChange={(e) => setFormDuration(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-slate-500 font-bold">Tautan Grup WhatsApp Kelas *</label>
                    <input type="url" required placeholder="https://chat.whatsapp.com/..." value={formWhatsappGroupUrl} onChange={(e) => setFormWhatsappGroupUrl(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1.5 pt-6 flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" checked={formIsFeatured} onChange={(e) => setFormIsFeatured(e.target.checked)} className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer" />
                      <span className="text-slate-700 font-bold">Tandai Kelas Ini Sebagai Terpopuler (Featured)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Outcomes */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                  <h4 className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">4. Poin Hasil Belajar (Outcomes)</h4>
                  <button type="button" onClick={handleAddOutcomeField} className="text-primary hover:text-primary-container text-[10px] font-bold flex items-center gap-1"><PlusCircle className="w-4 h-4" /> Tambah Poin</button>
                </div>
                
                <div className="space-y-2">
                  {formOutcomes.map((outcome, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input type="text" placeholder={`Poin Hasil Belajar #${idx + 1}`} value={outcome} onChange={(e) => handleOutcomeChange(idx, e.target.value)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none bg-slate-50/50" />
                      <button type="button" onClick={() => handleRemoveOutcomeField(idx)} className="text-rose-500 hover:text-rose-600"><MinusCircle className="w-4.5 h-4.5" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                  <h4 className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">5. Fasilitas Kelas (Benefits)</h4>
                  <button type="button" onClick={handleAddBenefitField} className="text-primary hover:text-primary-container text-[10px] font-bold flex items-center gap-1"><PlusCircle className="w-4 h-4" /> Tambah Fasilitas</button>
                </div>
                
                <div className="space-y-2">
                  {formBenefits.map((benefit, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input type="text" placeholder={`Fasilitas Kelas #${idx + 1}`} value={benefit} onChange={(e) => handleBenefitChange(idx, e.target.value)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none bg-slate-50/50" />
                      <button type="button" onClick={() => handleRemoveBenefitField(idx)} className="text-rose-500 hover:text-rose-600"><MinusCircle className="w-4.5 h-4.5" /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 transition cursor-pointer">Batal</button>
                <button type="submit" disabled={formSubmitting} className="px-6 py-2.5 rounded-full primary-gradient text-white hover:shadow-lg transition cursor-pointer shadow-md disabled:opacity-50">
                  {formSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
