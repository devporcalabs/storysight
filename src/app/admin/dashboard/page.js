"use client";
import { useEffect, useState } from "react";
import { Users, BookOpen, Award, CheckCircle2, TrendingUp } from "lucide-react";

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/admin/analytics");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-display font-black text-slate-800 tracking-tight">Admin Cockpit</h1>
        <p className="text-slate-500 font-sans font-semibold text-xs mt-1">
          Monitor overall student metrics, completions, scores, and active user details.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
        <div className="bg-white rounded-[20px] border border-slate-100/80 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">Total Students</span>
          <div className="flex items-end justify-between mt-4">
            <span className="text-3xl font-display font-black text-slate-800">{data?.totalUsers || 0}</span>
            <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[20px] border border-slate-100/80 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">Stories Catalog</span>
          <div className="flex items-end justify-between mt-4">
            <span className="text-3xl font-display font-black text-slate-800">{data?.totalStories || 0}</span>
            <div className="bg-primary-container/10 text-primary-container p-2.5 rounded-xl">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[20px] border border-slate-100/80 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">Quiz Submissions</span>
          <div className="flex items-end justify-between mt-4">
            <span className="text-3xl font-display font-black text-slate-800">{data?.totalAttempts || 0}</span>
            <div className="bg-tertiary/10 text-tertiary p-2.5 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[20px] border border-slate-100/80 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">Average Score</span>
          <div className="flex items-end justify-between mt-4">
            <span className="text-3xl font-display font-black text-slate-800">{data?.avgScore || 0}%</span>
            <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl border border-emerald-100">
              <Award className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[20px] border border-slate-100/80 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between col-span-2 md:col-span-1 lg:col-span-1">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">Completion Rate</span>
          <div className="flex items-end justify-between mt-4">
            <span className="text-3xl font-display font-black text-slate-800">{data?.completionRate || 0}%</span>
            <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* User Register List */}
      <div className="bg-white rounded-[24px] border border-slate-100/80 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden">
        <h2 className="text-lg font-display font-bold text-slate-800 tracking-tight mb-6">Student Activity Register</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/40 text-slate-400 font-extrabold uppercase tracking-wider font-mono">
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Stories Completed</th>
                <th className="py-3 px-4">Quiz Attempts</th>
                <th className="py-3 px-4">Average Score</th>
                <th className="py-3 px-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50 font-semibold text-slate-700">
              {data?.users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 font-medium">No registered students yet.</td>
                </tr>
              ) : (
                data?.users.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-primary/5 border-l-2 border-l-transparent hover:border-l-primary transition-all duration-150"
                  >
                    <td className="py-4 px-4 font-bold text-slate-800">{student.name}</td>
                    <td className="py-4 px-4 text-slate-500 font-sans">{student.email}</td>
                    <td className="py-4 px-4">
                      <span className="inline-block bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100 text-[10px]">
                        {student.completedCount} Completed
                      </span>
                    </td>
                    <td className="py-4 px-4 font-sans">{student.attemptsCount} attempts</td>
                    <td className="py-4 px-4 font-sans">
                      <span className={`font-bold ${student.averageScore >= 70 ? "text-emerald-600" : "text-rose-500"}`}>
                        {student.averageScore}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400 text-[10px] font-sans">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
