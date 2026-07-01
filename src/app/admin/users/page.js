"use client";
import { useEffect, useState } from "react";
import { 
  Search, Plus, Edit, Trash2, Eye, BookOpen, Award, 
  Shield, School, UserPlus, X, CheckCircle2, XCircle, 
  Lock, Mail, User, BookOpenCheck, FileDown, FileUp 
} from "lucide-react";

export default function AdminUsersPage() {
  const [session, setSession] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form fields
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("STUDENT");
  const [formSchool, setFormSchool] = useState("");
  const [formExpiresAt, setFormExpiresAt] = useState("");

  // CSV Import state
  const [importFile, setImportFile] = useState(null);
  const [importProgress, setImportProgress] = useState(null);
  const [importSubmitting, setImportSubmitting] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Fetch session
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setSession(data.user);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchSession();
  }, []);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (roleFilter) params.append("role", roleFilter);
      if (schoolFilter) params.append("school", schoolFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error("Fetch users error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchUsers();
    }
  }, [session, searchQuery, roleFilter, schoolFilter]);

  // Open modals
  const handleOpenAddModal = () => {
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("STUDENT");
    setFormSchool(session.role === "TEACHER" ? session.school : "");
    setFormExpiresAt("");
    setErrorMsg("");
    setSuccessMsg("");
    setShowAddModal(true);
  };

  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword("");
    setFormRole(user.role);
    setFormSchool(user.school || "");
    const formattedDate = user.expiresAt ? new Date(user.expiresAt).toISOString().split('T')[0] : "";
    setFormExpiresAt(formattedDate);
    setErrorMsg("");
    setSuccessMsg("");
    setShowEditModal(true);
  };

  const handleOpenProgressModal = (user) => {
    setSelectedUser(user);
    setShowProgressModal(true);
  };

  // Submit Add User
  const handleAddUser = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setFormSubmitting(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          password: formPassword,
          role: session.role === "TEACHER" ? "STUDENT" : formRole,
          school: session.role === "TEACHER" ? session.school : formSchool,
          expiresAt: formExpiresAt || null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || "User created successfully!");
        setTimeout(() => {
          setShowAddModal(false);
          fetchUsers();
        }, 1200);
      } else {
        setErrorMsg(data.error || "Failed to create user");
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Submit Edit User
  const handleEditUser = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setFormSubmitting(true);

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          password: formPassword || undefined,
          role: session.role === "TEACHER" ? "STUDENT" : formRole,
          school: session.role === "TEACHER" ? session.school : formSchool,
          expiresAt: formExpiresAt || null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || "User updated successfully!");
        setTimeout(() => {
          setShowEditModal(false);
          fetchUsers();
        }, 1200);
      } else {
        setErrorMsg(data.error || "Failed to update user");
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  };
  // Submit Delete User
  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user? All their progress and quiz attempts will be permanently lost.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("User deleted successfully.");
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete user");
      }
    } catch (e) {
      alert("Network error. Failed to delete user.");
    }
  };

  // Export Student Data to CSV
  const handleExportCSV = () => {
    const studentsToExport = users.filter(u => u.role === "STUDENT");
    if (studentsToExport.length === 0) {
      alert("Tidak ada data siswa untuk diekspor.");
      return;
    }

    let csvContent = "\uFEFFname,email,role,school,createdAt\n"; // UTF-8 BOM for Excel compatibility

    studentsToExport.forEach(u => {
      const nameEscaped = `"${u.name.replace(/"/g, '""')}"`;
      const emailEscaped = `"${u.email.replace(/"/g, '""')}"`;
      const roleEscaped = `"${u.role.replace(/"/g, '""')}"`;
      const schoolEscaped = `"${(u.school || "").replace(/"/g, '""')}"`;
      const dateEscaped = `"${new Date(u.createdAt).toLocaleDateString()}"`;
      
      csvContent += `${nameEscaped},${emailEscaped},${roleEscaped},${schoolEscaped},${dateEscaped}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `data_siswa_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import Student Data from CSV
  const handleImportCSVSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) return;

    setImportSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
      
      if (lines.length <= 1) {
        setErrorMsg("File CSV kosong atau hanya berisi header.");
        setImportSubmitting(false);
        return;
      }

      // Parse headers
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ""));
      const nameIdx = headers.indexOf("name");
      const emailIdx = headers.indexOf("email");
      const passwordIdx = headers.indexOf("password");
      const schoolIdx = headers.indexOf("school");

      if (nameIdx === -1 || emailIdx === -1 || passwordIdx === -1) {
        setErrorMsg("Header CSV harus memiliki kolom: name, email, dan password.");
        setImportSubmitting(false);
        return;
      }

      const rows = lines.slice(1);
      const total = rows.length;
      let success = 0;
      let errors = [];

      setImportProgress({ total, current: 0, success: 0, errors: [] });

      for (let i = 0; i < total; i++) {
        const row = rows[i];
        if (!row.trim()) continue;

        // Parse CSV row respecting potential quotes
        const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || row.split(",");
        const cells = matches.map(c => c.trim().replace(/^["']|["']$/g, "").replace(/""/g, '"'));

        const name = cells[nameIdx];
        const email = cells[emailIdx];
        const password = cells[passwordIdx];
        const school = schoolIdx !== -1 ? cells[schoolIdx] : "";

        if (!name || !email || !password) {
          errors.push(`Baris ${i + 2}: Kolom nama, email, atau password kosong.`);
          setImportProgress(prev => ({ ...prev, current: i + 1, errors }));
          continue;
        }

        try {
          const res = await fetch("/api/admin/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              email,
              password,
              role: "STUDENT",
              school: session.role === "TEACHER" ? session.school : school,
            }),
          });

          const data = await res.json();
          if (res.ok) {
            success++;
          } else {
            errors.push(`Baris ${i + 2} (${email}): ${data.error || "Gagal menambahkan."}`);
          }
        } catch (err) {
          errors.push(`Baris ${i + 2} (${email}): Gangguan koneksi server.`);
        }

        setImportProgress(prev => ({
          ...prev,
          current: i + 1,
          success,
          errors: [...errors]
        }));
      }

      setSuccessMsg(`Berhasil mengimpor ${success} dari ${total} siswa.`);
      fetchUsers();
      setImportSubmitting(false);
    };

    reader.readAsText(importFile);
  };

  // Extract unique school list for Superadmin filter
  const schoolList = Array.from(
    new Set(users.map(u => u.school).filter(s => s !== null && s !== ""))
  );

  // Render role badges
  const renderRoleBadge = (role) => {
    switch (role) {
      case "SUPERADMIN":
        return (
          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg border border-purple-100 text-[10px] font-mono font-bold">
            <Shield className="w-3 h-3" /> Super Admin
          </span>
        );
      case "TEACHER":
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-100 text-[10px] font-mono font-bold">
            <User className="w-3 h-3" /> Teacher
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100 text-[10px] font-mono font-bold">
            <BookOpen className="w-3 h-3" /> Student
          </span>
        );
    }
  };

  if (!session) {
    return (
      <div className="flex-1 flex justify-center items-center h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate statistics
  const totalStudents = users.filter(u => u.role === "STUDENT").length;
  const avgScore = totalStudents > 0 
    ? Math.round(users.filter(u => u.role === "STUDENT").reduce((sum, u) => sum + u.averageScore, 0) / totalStudents)
    : 0;
  const totalCompletedStories = users.filter(u => u.role === "STUDENT").reduce((sum, u) => sum + u.completedCount, 0);

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-slate-800 tracking-tight">
            {session.role === "SUPERADMIN" ? "User Management" : "My Students"}
          </h1>
          <p className="text-slate-500 font-sans font-semibold text-xs mt-1">
            {session.role === "SUPERADMIN" 
              ? "Oversee and manage registration credentials, roles, and learning metrics for all users." 
              : `View student activity, progress tracker, and scores for ${session.school}.`
            }
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-1.5 py-3 px-4 bg-white/60 border border-slate-200 text-slate-700 rounded-xl font-display text-xs font-bold shadow-sm hover:bg-slate-50 transition cursor-pointer"
            title="Ekspor Data Siswa ke CSV"
          >
            <FileDown className="w-4 h-4 text-slate-500" />
            Ekspor CSV
          </button>

          <button
            onClick={() => {
              setImportFile(null);
              setImportProgress(null);
              setErrorMsg("");
              setSuccessMsg("");
              setShowImportModal(true);
            }}
            className="flex items-center justify-center gap-1.5 py-3 px-4 bg-white/60 border border-slate-200 text-slate-700 rounded-xl font-display text-xs font-bold shadow-sm hover:bg-slate-50 transition cursor-pointer"
            title="Impor Data Siswa dari CSV"
          >
            <FileUp className="w-4 h-4 text-slate-500" />
            Impor CSV
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 py-3 px-5 primary-gradient text-white rounded-xl font-display text-xs font-bold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            {session.role === "SUPERADMIN" ? "Add User" : "Add Student"}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">
            {session.role === "SUPERADMIN" ? "Total Registered Students" : "Students at School"}
          </span>
          <div className="flex items-end justify-between mt-4">
            <span className="text-3xl font-display font-black text-slate-800">{totalStudents}</span>
            <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
              <User className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">Average Quiz Score</span>
          <div className="flex items-end justify-between mt-4">
            <span className="text-3xl font-display font-black text-slate-800">{avgScore}%</span>
            <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl border border-emerald-100">
              <Award className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">Total Stories Finished</span>
          <div className="flex items-end justify-between mt-4">
            <span className="text-3xl font-display font-black text-slate-800">{totalCompletedStories}</span>
            <div className="bg-primary-container/10 text-primary-container p-2.5 rounded-xl">
              <BookOpenCheck className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="glass-card p-4 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari pengguna berdasarkan nama, email, sekolah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs glass-input font-semibold outline-none"
          />
        </div>

        {/* Filters (Superadmin Only) */}
        {session.role === "SUPERADMIN" && (
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl text-xs glass-input font-semibold bg-white/40 border border-slate-200/40 text-slate-700 outline-none"
            >
              <option value="" className="bg-white">All Roles</option>
              <option value="SUPERADMIN" className="bg-white">Super Admin</option>
              <option value="TEACHER" className="bg-white">Teacher</option>
              <option value="STUDENT" className="bg-white">Student</option>
            </select>

            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl text-xs glass-input font-semibold bg-white/40 border border-slate-200/40 text-slate-700 outline-none"
            >
              <option value="" className="bg-white">All Schools</option>
              {schoolList.map(school => (
                <option key={school} value={school} className="bg-white">{school}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Directory Table */}
      <div className="glass-card p-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/40 text-slate-400 font-extrabold uppercase tracking-wider font-mono">
                <th className="py-3 px-4">Name / Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">School Origin</th>
                <th className="py-3 px-4">Completed Stories</th>
                <th className="py-3 px-4">Quiz Avg. Score</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50 font-semibold text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 font-medium">
                    No users found matching parameters.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-primary/5 border-l-2 border-l-transparent hover:border-l-primary transition-all duration-150"
                  >
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-bold text-slate-800">{user.name}</div>
                        <div className="text-slate-400 text-[10px] font-sans mt-0.5">{user.email}</div>
                        {user.expiresAt && (
                          <div className={`text-[9px] font-bold mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${
                            new Date() > new Date(user.expiresAt)
                              ? "bg-rose-50 text-rose-600 border border-rose-100"
                              : "bg-slate-50 text-slate-500 border border-slate-100"
                          }`}>
                            <Lock className="w-2.5 h-2.5 animate-pulse" />
                            {new Date() > new Date(user.expiresAt)
                              ? `Expired: ${new Date(user.expiresAt).toLocaleDateString()}`
                              : `Expires: ${new Date(user.expiresAt).toLocaleDateString()}`
                            }
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">{renderRoleBadge(user.role)}</td>
                    <td className="py-4 px-4 font-sans">
                      {user.school ? (
                        <div className="flex items-center gap-1 text-slate-600">
                          <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{user.school}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {user.role === "STUDENT" ? (
                        <span className="inline-block bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100 text-[10px]">
                          {user.completedCount} Stories
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {user.role === "STUDENT" ? (
                        <span className={`font-mono font-bold ${user.averageScore >= 70 ? "text-emerald-600" : user.attemptsCount > 0 ? "text-rose-500" : "text-slate-400"}`}>
                          {user.attemptsCount > 0 ? `${user.averageScore}%` : "No attempts"}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-400 text-[10px] font-sans">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {user.role === "STUDENT" && (
                          <button
                            onClick={() => handleOpenProgressModal(user)}
                            title="View Student Progress"
                            className="p-1.5 hover:bg-primary/10 text-slate-500 hover:text-primary rounded-lg transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          title="Edit User"
                          className="p-1.5 hover:bg-amber-50 text-slate-500 hover:text-amber-600 rounded-lg transition cursor-pointer border border-transparent hover:border-amber-100"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          title="Delete User"
                          className="p-1.5 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg transition cursor-pointer border border-transparent hover:border-rose-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add User */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" />
                {session.role === "SUPERADMIN" ? "Add New User" : "Add Student"}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold px-4 py-3 rounded-xl">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> {successMsg}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs border border-slate-200 outline-none focus:border-primary transition font-semibold"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs border border-slate-200 outline-none focus:border-primary transition font-semibold"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs border border-slate-200 outline-none focus:border-primary transition font-semibold"
                    placeholder="•••••••• (Min 6 chars)"
                  />
                </div>
              </div>

              {session.role === "SUPERADMIN" && (
                <>
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">User Role</label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-xs border border-slate-200 outline-none focus:border-primary transition font-semibold"
                    >
                      <option value="STUDENT">Student</option>
                      <option value="TEACHER">Teacher</option>
                      <option value="SUPERADMIN">Super Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">School Origin</label>
                    <div className="relative">
                      <School className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required={formRole !== "SUPERADMIN"}
                        disabled={formRole === "SUPERADMIN"}
                        value={formSchool}
                        onChange={(e) => setFormSchool(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs border border-slate-200 outline-none focus:border-primary transition font-semibold disabled:bg-slate-50 disabled:text-slate-400"
                        placeholder={formRole === "SUPERADMIN" ? "N/A - Admin has no school" : "e.g. SMA Negeri 1 Jakarta"}
                      />
                    </div>
                  </div>
                </>
              )}

              {session.role === "TEACHER" && (
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">School (Automatic)</label>
                  <div className="bg-slate-50 border border-slate-100 text-slate-500 rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5">
                    <School className="w-4 h-4 text-slate-400" /> {session.school}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">Account Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={formExpiresAt}
                  onChange={(e) => setFormExpiresAt(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs border border-slate-200 outline-none focus:border-primary transition font-semibold"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 text-xs font-bold text-white primary-gradient rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {formSubmitting ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
                <Edit className="w-4 h-4 text-amber-500" />
                Edit User Details
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditUser} className="p-6 space-y-4">
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold px-4 py-3 rounded-xl">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> {successMsg}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs border border-slate-200 outline-none focus:border-primary transition font-semibold"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs border border-slate-200 outline-none focus:border-primary transition font-semibold"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">New Password (Optional)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs border border-slate-200 outline-none focus:border-primary transition font-semibold"
                    placeholder="Leave blank to keep current"
                  />
                </div>
              </div>

              {session.role === "SUPERADMIN" && (
                <>
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">User Role</label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-xs border border-slate-200 outline-none focus:border-primary transition font-semibold"
                    >
                      <option value="STUDENT">Student</option>
                      <option value="TEACHER">Teacher</option>
                      <option value="SUPERADMIN">Super Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">School Origin</label>
                    <div className="relative">
                      <School className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required={formRole !== "SUPERADMIN"}
                        disabled={formRole === "SUPERADMIN"}
                        value={formSchool}
                        onChange={(e) => setFormSchool(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs border border-slate-200 outline-none focus:border-primary transition font-semibold disabled:bg-slate-50 disabled:text-slate-400"
                        placeholder={formRole === "SUPERADMIN" ? "N/A - Admin has no school" : "e.g. SMA Negeri 1 Jakarta"}
                      />
                    </div>
                  </div>
                </>
              )}

              {session.role === "TEACHER" && (
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">School (Automatic)</label>
                  <div className="bg-slate-50 border border-slate-100 text-slate-500 rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5">
                    <School className="w-4 h-4 text-slate-400" /> {session.school}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">Account Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={formExpiresAt}
                  onChange={(e) => setFormExpiresAt(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs border border-slate-200 outline-none focus:border-primary transition font-semibold"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {formSubmitting ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Progress */}
      {showProgressModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-primary" />
                  Student Learning Profile
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold font-mono uppercase mt-0.5">{selectedUser.name} &bull; {selectedUser.school}</p>
              </div>
              <button onClick={() => setShowProgressModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-8 flex-1">
              {/* Stats Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wide">Stories Completed</span>
                  <span className="text-2xl font-display font-black text-slate-700 mt-1">{selectedUser.completedCount}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wide">Average Score</span>
                  <span className="text-2xl font-display font-black text-slate-700 mt-1">{selectedUser.averageScore}%</span>
                </div>
              </div>

              {/* Story Progress */}
              <div>
                <h4 className="font-display font-bold text-slate-800 text-xs mb-3 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-slate-400" /> Story Progress Registry
                </h4>
                {selectedUser.progress.length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold py-4 text-center bg-slate-50 rounded-xl">No story content accessed yet.</p>
                ) : (
                  <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                    {selectedUser.progress.map((prog, index) => (
                      <div key={index} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
                        <span className="font-bold text-slate-800">{prog.story.title}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                          prog.progressStatus === "COMPLETED" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}>
                          {prog.progressStatus === "COMPLETED" ? "Selesai" : "Sedang Dibaca"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quiz Attempts */}
              <div>
                <h4 className="font-display font-bold text-slate-800 text-xs mb-3 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-slate-400" /> Quiz Submission Log
                </h4>
                {selectedUser.attempts.length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold py-4 text-center bg-slate-50 rounded-xl">No quiz submissions yet.</p>
                ) : (
                  <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                    {selectedUser.attempts.map((att, index) => (
                      <div key={index} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50/50">
                        <div>
                          <div className="font-bold text-slate-800">{att.story.title}</div>
                          <div className="text-[10px] text-slate-400 font-sans mt-0.5">{new Date(att.createdAt).toLocaleString()}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`font-mono font-bold text-sm ${att.passed ? "text-emerald-600" : "text-rose-500"}`}>
                            {att.score}%
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold ${
                            att.passed 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                              : "bg-rose-50 text-rose-700 border border-rose-100"
                          }`}>
                            {att.passed ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                            {att.passed ? "Lulus" : "Gagal"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0 text-right">
              <button
                type="button"
                onClick={() => setShowProgressModal(false)}
                className="px-5 py-2.5 text-xs font-bold text-white primary-gradient rounded-xl shadow-md hover:shadow-lg cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Import CSV */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
                <FileUp className="w-4 h-4 text-primary" />
                Impor Siswa via CSV
              </h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleImportCSVSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold px-4 py-3 rounded-xl">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> {successMsg}
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl space-y-2 text-[10px] text-slate-500 font-semibold leading-relaxed font-sans">
                <p className="font-bold text-slate-700">Format File CSV:</p>
                <p>File CSV harus memiliki baris pertama sebagai header dengan kolom berikut:</p>
                <code className="block bg-slate-950 text-slate-200 p-2 rounded font-mono text-[9px]">name,email,password,school</code>
                <p className="text-[9px] text-slate-400 italic">* Kolom school bersifat opsional. Bagi guru, sekolah otomatis disesuaikan.</p>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">Pilih File CSV</label>
                <input
                  type="file"
                  accept=".csv"
                  required
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="w-full text-xs font-semibold text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer"
                />
              </div>

              {/* Import Progress Section */}
              {importProgress && (
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-2 text-xs font-semibold text-slate-600">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                    <span>Progres: {importProgress.current} / {importProgress.total} baris</span>
                    <span>Selesai: {importProgress.success}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                    />
                  </div>
                  {importProgress.errors.length > 0 && (
                    <div className="max-h-24 overflow-y-auto text-[10px] text-rose-600 font-mono space-y-1 mt-2 border-t border-slate-200/40 pt-2">
                      <p className="font-bold">Daftar Error/Lewati:</p>
                      {importProgress.errors.map((err, idx) => (
                        <p key={idx}>{err}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={importSubmitting || !importFile}
                  className="px-5 py-2.5 text-xs font-bold text-white primary-gradient rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {importSubmitting ? "Mengimpor..." : "Mulai Impor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
