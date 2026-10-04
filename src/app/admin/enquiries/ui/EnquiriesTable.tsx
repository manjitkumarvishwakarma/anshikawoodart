"use client";

import { useMemo, useState } from "react";

type Enquiry = {
    _id: string;
    name: string;
    phone: string;
    city?: string;
    notes?: string;
    template?: string;
    sizeKey?: string;
    materialName?: string;
    estimatedPrice?: number;
    previewImageUrl?: string;
    status: string;
    createdAt: string;
    customSize?: {
        enabled?: boolean;
        unit?: "inch" | "mm" | string;
        width?: number;
        height?: number;
        depth?: number;
    };
};

const statuses = ["all", "new", "contacted", "quoted", "confirmed", "completed", "cancelled"] as const;

function formatDate(value: string) {
    return new Date(value).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function toWhatsAppE164(phone: string) {
    const digits = phone.replace(/[^\d+]/g, "");
    if (digits.startsWith("+")) return digits.replace("+", "");
    // if 10 digits, assume India
    const onlyDigits = digits.replace(/\D/g, "");
    if (onlyDigits.length === 10) return `91${onlyDigits}`;
    return onlyDigits; // fallback
}

function buildWhatsAppMessage(e: Enquiry) {
    const lines = [
        `Hi ${e.name},`,
        `Regarding your furniture enquiry at Anshika Wood Art.`,
        "",
        `Item: ${e.template ?? "Mandir"}${e.sizeKey ? ` (${e.sizeKey})` : ""}`,
        e.materialName ? `Wood: ${e.materialName}` : "",
        `Estimate: ₹ ${(e.estimatedPrice ?? 0).toLocaleString("en-IN")}`,
        e.city ? `City: ${e.city}` : "",
        "",
        `Thanks,`,
        `Anshika Wood Art, Pune`,
    ].filter(Boolean);

    return lines.join("\n");
}

export default function EnquiriesTable({ initialEnquiries }: { initialEnquiries: Enquiry[] }) {
    const [rows, setRows] = useState(initialEnquiries);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState<(typeof statuses)[number]>("all");
    const [q, setQ] = useState("");

    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase();
        return rows.filter((e) => {
            const statusOk = statusFilter === "all" ? true : e.status === statusFilter;
            if (!statusOk) return false;
            if (!query) return true;

            const hay = `${e.name ?? ""} ${e.phone ?? ""} ${e.city ?? ""}`.toLowerCase();
            return hay.includes(query);
        });
    }, [rows, q, statusFilter]);

    async function updateStatus(id: string, status: string) {
        setSavingId(id);
        setError(null);

        try {
            const response = await fetch(`/api/admin/enquiries/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });

            const data = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error(data?.error ?? `Failed to update status (HTTP ${response.status})`);
            }

            setRows((current) =>
                current.map((row) => (row._id === id ? { ...row, status: data.enquiry.status } : row))
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : "Update failed");
        } finally {
            setSavingId(null);
        }
    }

    async function whatsappAndMarkContacted(e: Enquiry) {
        setError(null);
        const waPhone = toWhatsAppE164(e.phone);
        const msg = buildWhatsAppMessage(e);
        const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`;

        // open whatsapp immediately
        window.open(waUrl, "_blank", "noopener,noreferrer");

        // auto mark as contacted if currently new
        if (e.status === "new") {
            await updateStatus(e._id, "contacted");
        }
    }

    async function exportCsv() {
        setError(null);
        try {
            const url = `/api/admin/enquiries/export?status=${encodeURIComponent(statusFilter)}&q=${encodeURIComponent(
                q.trim()
            )}`;

            const res = await fetch(url);
            if (!res.ok) {
                const t = await res.text();
                throw new Error(`Export failed (HTTP ${res.status}): ${t.slice(0, 120)}`);
            }

            const blob = await res.blob();
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (e: any) {
            setError(e?.message ?? "Export failed");
        }
    }

    return (
        <div className="space-y-3">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 items-center">
                <input
                    className="rounded border px-3 py-2 text-sm w-[260px]"
                    placeholder="Search name / phone / city"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />

                <select
                    className="rounded border px-3 py-2 text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                    {statuses.map((s) => (
                        <option key={s} value={s}>
                            {s === "all" ? "All statuses" : s}
                        </option>
                    ))}
                </select>

                <button
                    type="button"
                    className="rounded bg-black text-white px-4 py-2 text-sm"
                    onClick={exportCsv}
                >
                    Export CSV
                </button>

                <div className="text-sm text-gray-600 ml-auto">
                    Showing <b>{filtered.length}</b> / {rows.length}
                </div>
            </div>

            {error ? (
                <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            ) : null}

            {filtered.length === 0 ? (
                <div className="rounded border p-8 text-center text-gray-500">No enquiries match filters.</div>
            ) : (
                <div className="overflow-x-auto rounded border">
                    <table className="min-w-[1250px] w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 text-left">Customer</th>
                                <th className="p-3 text-left">Furniture</th>
                                <th className="p-3 text-left">Design</th>
                                <th className="p-3 text-left">Estimate</th>
                                <th className="p-3 text-left">Notes</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 text-left">Actions</th>
                                <th className="p-3 text-left">Received</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filtered.map((e) => (
                                <tr key={e._id} className="border-t align-top">
                                    <td className="p-3">
                                        <div className="font-medium flex items-center gap-2">
                                            <span>{e.name}</span>

                                            {e.status === "new" ? (
                                                <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[11px] font-semibold">
                                                    NEW
                                                </span>
                                            ) : null}
                                        </div>
                                        <a href={`tel:${e.phone}`} className="text-blue-600 hover:underline">
                                            {e.phone}
                                        </a>
                                        {e.city ? <div className="text-gray-500">{e.city}</div> : null}
                                    </td>

                                    <td className="p-3">
                                        <div>{e.template || "Mandir"}</div>
                                        {e.sizeKey ? <div className="text-gray-500">{e.sizeKey}</div> : null}
                                        {e.materialName ? <div className="text-gray-500">{e.materialName}</div> : null}
                                        {e.customSize?.enabled ? (
                                            <div className="text-gray-700 mt-1">
                                                <span className="font-medium">Custom:</span>{" "}
                                                {(e.customSize.width ?? 0)}×{(e.customSize.height ?? 0)}×{(e.customSize.depth ?? 0)}{" "}
                                                {e.customSize.unit ?? "inch"}
                                            </div>
                                        ) : null}
                                    </td>

                                    <td className="p-3">
                                        {e.previewImageUrl ? (
                                            <a href={e.previewImageUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                                View preview
                                            </a>
                                        ) : (
                                            <span className="text-gray-400">No preview</span>
                                        )}
                                    </td>

                                    <td className="p-3 whitespace-nowrap">
                                        ₹ {(e.estimatedPrice ?? 0).toLocaleString("en-IN")}
                                    </td>

                                    <td className="p-3 max-w-[260px]">
                                        <p className="whitespace-pre-wrap text-gray-600">{e.notes || "—"}</p>
                                    </td>

                                    <td className="p-3">
                                        <select
                                            className="rounded border px-2 py-1"
                                            value={e.status}
                                            disabled={savingId === e._id}
                                            onChange={(ev) => updateStatus(e._id, ev.target.value)}
                                        >
                                            {statuses.filter((s) => s !== "all").map((s) => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </select>

                                        {savingId === e._id ? (
                                            <div className="mt-1 text-xs text-gray-500">Saving...</div>
                                        ) : null}
                                    </td>

                                    <td className="p-3">
                                        <div className="flex flex-col gap-2">
                                            <button
                                                type="button"
                                                className="rounded bg-emerald-700 text-white px-3 py-2 text-xs"
                                                onClick={() => whatsappAndMarkContacted(e)}
                                            >
                                                WhatsApp customer
                                            </button>

                                            <button
                                                type="button"
                                                className="rounded border px-3 py-2 text-xs"
                                                onClick={() => updateStatus(e._id, "contacted")}
                                                disabled={savingId === e._id}
                                            >
                                                Mark contacted
                                            </button>
                                        </div>
                                    </td>

                                    <td className="p-3 whitespace-nowrap text-gray-600">
                                        {formatDate(e.createdAt)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}