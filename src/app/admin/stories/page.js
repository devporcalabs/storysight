"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Trash2, Eye, EyeOff, AlertCircle, Edit } from "lucide-react";

export default function AdminStoriesPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stories");
      if (res.ok) {
        const json = await res.json();
        setStories(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "Published" ? "Draft" : "Published";
    try {
      const res = await fetch(`/api/stories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        fetchStories();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this story? This will permanently delete the story and all related quiz attempts.")) return;
    try {
      const res = await fetch(`/api/stories/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchStories();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-slate-800 tracking-tight">Manage Stories</h1>
          <p className="text-slate-500 font-sans font-semibold text-xs mt-1">
            Create, edit, delete, and control public publish status of learning stories.
          </p>
        </div>
        <Link
          href="/admin/stories/new"
          className="flex items-center gap-1.5 px-4.5 py-3 rounded-xl primary-gradient text-white text-xs font-display font-black shadow-md hover:shadow-lg transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" /> Add Story
        </Link>
      </div>

      {/* Stories list table */}
      <div className="glass-card p-6 overflow-hidden">
        {stories.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center">
            <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-sm font-display font-bold text-slate-700">No stories added yet</h3>
            <p className="text-slate-500 text-xs mt-1 font-medium font-sans">Click "Add Story" to bootstrap your catalog.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/40 text-slate-400 font-extrabold uppercase tracking-wider font-mono">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Genre</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50 font-semibold text-slate-700">
                {stories.map((story) => (
                  <tr
                    key={story.id}
                    className="hover:bg-primary/5 border-l-2 border-l-transparent hover:border-l-primary transition-all duration-150"
                  >
                    <td className="py-4 px-4 font-bold text-slate-800">
                      <div>
                        <span>{story.title}</span>
                        <span className="block text-[9px] text-slate-400 font-semibold font-sans mt-0.5">/stories/{story.slug}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-wide font-mono">
                        {story.level}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-wide">
                        {story.genre}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-sans">{Math.round(story.duration / 60)} mins</td>
                    <td className="py-4 px-4 font-sans">
                      <button
                        onClick={() => handleToggleStatus(story.id, story.status)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border cursor-pointer transition-all ${
                          story.status === "Published"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-amber-50 border-amber-200 text-amber-700"
                        }`}
                      >
                        {story.status === "Published" ? (
                          <>
                            <Eye className="w-3.5 h-3.5" /> Published
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" /> Draft
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => handleToggleStatus(story.id, story.status)}
                          className="p-2 border border-slate-200 text-slate-500 hover:border-primary/40 hover:text-primary hover:bg-primary/5 rounded-lg transition cursor-pointer"
                          title={story.status === "Published" ? "Unpublish (Draft)" : "Publish"}
                        >
                          {story.status === "Published" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>

                        <Link
                          href={`/admin/stories/${story.id}`}
                          className="p-2 border border-slate-200 text-slate-500 hover:border-primary/40 hover:text-primary hover:bg-primary/5 rounded-lg transition cursor-pointer flex items-center justify-center"
                          title="Edit Story"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        
                        <button
                          onClick={() => handleDelete(story.id)}
                          className="p-2 border border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-300 rounded-lg transition cursor-pointer"
                          title="Delete Story"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
