"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  Trophy,
  Plus,
  Trash2,
  Search,
  Globe,
  Radio,
  Check,
  AlertCircle,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useIdleSession } from "@/lib/use-idle-session";
import { EventItem } from "@/server/event.service";
import { formatDate } from "@/lib/utils";

interface EventsFeedClientProps {
  initialEvents: EventItem[];
}

export function EventsFeedClient({ initialEvents }: EventsFeedClientProps) {
  const { user } = useIdleSession();
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<string>("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    organizer: "",
    url: "",
    description: "",
    format: "JEOPARDY",
    locationType: "ONLINE",
    location: "Online",
    startDate: "",
    endDate: "",
    weight: "",
    prizePool: "",
  });

  const formats = [
    { label: "All Events", value: "ALL" },
    { label: "Jeopardy CTF", value: "JEOPARDY" },
    { label: "Attack-Defense", value: "ATTACK_DEFENSE" },
    { label: "Hackathons", value: "HACKATHON" },
    { label: "Wargames", value: "WARGAME" },
    { label: "Mixed / Other", value: "MIXED" },
  ];

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchesFormat =
        selectedFormat === "ALL" || ev.format === selectedFormat;
      if (!matchesFormat) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        ev.title.toLowerCase().includes(q) ||
        ev.organizer.toLowerCase().includes(q) ||
        ev.description.toLowerCase().includes(q) ||
        (ev.location && ev.location.toLowerCase().includes(q))
      );
    });
  }, [events, selectedFormat, searchQuery]);

  const handleOpenPostModal = () => {
    if (!user) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(
        window.location.pathname
      )}`;
      return;
    }
    setFormError(null);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.title || !formData.organizer || !formData.url || !formData.description) {
      setFormError("Please fill out all required fields.");
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setFormError("Please specify valid start and end dates.");
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (end < start) {
      setFormError("End deadline cannot be before the start date.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          organizer: formData.organizer,
          url: formData.url,
          description: formData.description,
          format: formData.format,
          locationType: formData.locationType,
          location: formData.location || "Online",
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          weight: formData.weight ? parseFloat(formData.weight) : null,
          prizePool: formData.prizePool || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create event.");
      }

      const createdEvent: EventItem = await res.json();
      setEvents((prev) => [createdEvent, ...prev]);
      setModalOpen(false);
      setFormData({
        title: "",
        organizer: "",
        url: "",
        description: "",
        format: "JEOPARDY",
        locationType: "ONLINE",
        location: "Online",
        startDate: "",
        endDate: "",
        weight: "",
        prizePool: "",
      });
    } catch (err: any) {
      setFormError(err?.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to remove this event?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete event.");
      }

      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      alert(err?.message || "Failed to delete event.");
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Helper to compute dynamic countdown and status badge
   */
  const getEventStatus = (startDate: string | Date, endDate: string | Date) => {
    const now = new Date().getTime();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    if (now >= start && now <= end) {
      return {
        label: "LIVE NOW",
        color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        pulsing: true,
      };
    }

    if (now < start) {
      const days = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
      return {
        label: days === 1 ? "Starts Tomorrow" : `Starts in ${days} days`,
        color: "bg-sky-500/10 text-sky-400 border-sky-500/20",
        pulsing: false,
      };
    }

    return {
      label: "Concluding Today",
      color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      pulsing: false,
    };
  };

  return (
    <div className="w-full space-y-8 font-sans">
      {/* Action Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#12151C]/90 backdrop-blur-md border border-[#242936] shadow-xl">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#475569]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search upcoming CTFs, hackathons, organizers, or locations..."
            className="w-full bg-[#181C25] border border-[#242936] focus:border-[#22D3A0] rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder-[#475569] focus:outline-none transition-colors min-h-[44px]"
          />
        </div>

        {/* CTA: Post Event Button */}
        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={handleOpenPostModal}
            className="w-full sm:w-auto bg-[#22D3A0] hover:bg-[#1eb88b] text-[#0B0D12] font-mono text-xs font-bold gap-2 min-h-[44px] px-5 shadow-[0_0_15px_rgba(34,211,160,0.25)]"
          >
            <Plus className="h-4 w-4" />
            <span>Post Event / Hackathon</span>
          </Button>
        </div>
      </div>

      {/* Format Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none font-mono text-xs">
        {formats.map((f) => {
          const active = selectedFormat === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setSelectedFormat(f.value)}
              className={`px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap min-h-[40px] ${
                active
                  ? "bg-[#22D3A0] text-[#0B0D12] font-bold border-transparent shadow-[0_0_15px_rgba(34,211,160,0.25)]"
                  : "bg-[#12151C]/80 text-[#BACAC1] border-[#242936] hover:bg-[#181C25] hover:text-white"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Events Cards Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev) => {
            const status = getEventStatus(ev.startDate, ev.endDate);
            const isOwner = user?.id === ev.userId;
            const canDelete = isOwner || user?.role === "ADMIN";

            return (
              <div
                key={ev.id}
                className="flex flex-col justify-between p-6 rounded-2xl bg-[#12151C]/90 backdrop-blur-md border border-[#242936] hover:border-[#363E52] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.15)] group relative"
              >
                <div>
                  {/* Status & Format row */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`font-mono text-[10px] px-2.5 py-1 rounded-full border font-semibold flex items-center gap-1.5 ${status.color}`}
                    >
                      {status.pulsing && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      )}
                      <span>{status.label}</span>
                    </span>

                    <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-md bg-[#181C25] border border-[#242936] text-[#BACAC1]">
                      {ev.format.replace("_", " ")}
                    </span>
                  </div>

                  {/* Title & Organizer */}
                  <h3 className="font-sans font-bold text-lg text-white group-hover:text-[#22D3A0] transition-colors tracking-tight mb-1">
                    {ev.title}
                  </h3>
                  <p className="font-mono text-xs text-[#22D3A0] mb-3">
                    by {ev.organizer}
                  </p>

                  {/* Schedule dates */}
                  <div className="space-y-1.5 mb-4 text-xs font-mono text-[#BACAC1] bg-[#181C25]/80 p-3 rounded-xl border border-[#242936]/60">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-[#38BDF8] shrink-0" />
                      <span className="truncate">
                        {formatDate(ev.startDate)} — {formatDate(ev.endDate)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-[#FB923C] shrink-0" />
                      <span className="truncate">{ev.location || "Online"}</span>
                    </div>

                    {ev.prizePool && (
                      <div className="flex items-center gap-2 text-amber-400">
                        <Trophy className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate font-semibold">{ev.prizePool}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#94A3B8] leading-relaxed mb-4 line-clamp-3 font-sans">
                    {ev.description}
                  </p>
                </div>

                {/* Footer: User + Launch & Delete */}
                <div className="pt-4 border-t border-[#242936]/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#475569]">
                    <span>Posted by @{ev.user.username || "member"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEvent(ev.id)}
                        disabled={deletingId === ev.id}
                        aria-label="Delete event"
                        className="text-[#475569] hover:text-rose-400 hover:bg-rose-500/10 h-8 w-8 p-0 rounded-lg"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}

                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181C25] hover:bg-[#22D3A0] text-[#BACAC1] hover:text-[#0B0D12] border border-[#242936] hover:border-transparent font-mono text-xs font-bold transition-all"
                    >
                      <span>Join / Register</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-[#242936] bg-[#12151C]/60 max-w-xl mx-auto space-y-3">
          <Calendar className="h-10 w-10 text-[#475569] mx-auto opacity-40" />
          <h3 className="font-bold text-white text-base">No events found</h3>
          <p className="text-xs text-[#94A3B8]">
            No competitions match your current filters. Post the first event or check back soon!
          </p>
          <Button
            onClick={handleOpenPostModal}
            className="mt-2 bg-[#22D3A0] text-[#0B0D12] font-mono text-xs font-bold"
          >
            Post an Event
          </Button>
        </div>
      )}

      {/* Post Event Modal Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg bg-[#12151C] border border-[#242936] text-white p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-left">
            <DialogTitle className="text-lg font-bold text-white font-sans flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#22D3A0]" />
              <span>Post CTF Event or Hackathon</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-[#94A3B8]">
              Share an upcoming security tournament or hackathon with researchers worldwide. Events are automatically retired when their final day concludes.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 pt-2 font-mono text-xs">
            {formError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div>
              <label className="block text-[#BACAC1] mb-1 font-semibold">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. DEF CON 34 Qualifiers"
                className="w-full bg-[#181C25] border border-[#242936] focus:border-[#22D3A0] rounded-lg px-3 py-2 text-white placeholder-[#475569] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#BACAC1] mb-1 font-semibold">
                  Organizer / Host *
                </label>
                <input
                  type="text"
                  required
                  value={formData.organizer}
                  onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                  placeholder="e.g. Google InfoSec"
                  className="w-full bg-[#181C25] border border-[#242936] focus:border-[#22D3A0] rounded-lg px-3 py-2 text-white placeholder-[#475569] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#BACAC1] mb-1 font-semibold">
                  Format
                </label>
                <select
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  className="w-full bg-[#181C25] border border-[#242936] focus:border-[#22D3A0] rounded-lg px-3 py-2 text-white focus:outline-none"
                >
                  <option value="JEOPARDY">Jeopardy</option>
                  <option value="ATTACK_DEFENSE">Attack-Defense</option>
                  <option value="HACKATHON">Hackathon</option>
                  <option value="WARGAME">Wargame</option>
                  <option value="MIXED">Mixed / Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[#BACAC1] mb-1 font-semibold">
                Official Event Link / Registration URL *
              </label>
              <input
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://ctftime.org/event/..."
                className="w-full bg-[#181C25] border border-[#242936] focus:border-[#22D3A0] rounded-lg px-3 py-2 text-white placeholder-[#475569] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#BACAC1] mb-1 font-semibold">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-[#181C25] border border-[#242936] focus:border-[#22D3A0] rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#BACAC1] mb-1 font-semibold">
                  End Date / Deadline *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full bg-[#181C25] border border-[#242936] focus:border-[#22D3A0] rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#BACAC1] mb-1 font-semibold">
                  Location (or Online)
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Online or Las Vegas, NV"
                  className="w-full bg-[#181C25] border border-[#242936] focus:border-[#22D3A0] rounded-lg px-3 py-2 text-white placeholder-[#475569] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#BACAC1] mb-1 font-semibold">
                  Prize Pool (Optional)
                </label>
                <input
                  type="text"
                  value={formData.prizePool}
                  onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
                  placeholder="$10,000 USD, Swag, Certs"
                  className="w-full bg-[#181C25] border border-[#242936] focus:border-[#22D3A0] rounded-lg px-3 py-2 text-white placeholder-[#475569] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#BACAC1] mb-1 font-semibold">
                Event Description & Focus *
              </label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Give a brief synopsis of the challenge categories, eligible participants, team sizes, and rules..."
                className="w-full bg-[#181C25] border border-[#242936] focus:border-[#22D3A0] rounded-lg px-3 py-2 text-white placeholder-[#475569] focus:outline-none resize-none font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#242936]">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="border-[#242936] text-[#BACAC1] hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#22D3A0] hover:bg-[#1eb88b] text-[#0B0D12] font-bold"
              >
                {submitting ? "Publishing..." : "Publish Event"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
