import Link from "next/link";
import { adminLogout } from "./actions";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b p-4 flex flex-wrap gap-4 items-center">
        <Link href="/admin" className="font-semibold">
          Admin
        </Link>

        <nav className="flex flex-wrap gap-3 text-sm">
          <Link href="/admin/materials">Materials</Link>
          <Link href="/admin/templates">Templates</Link>
          <Link href="/admin/parts">Parts</Link>
          <Link href="/admin/enquiries">Enquiries</Link>
          <Link href="/admin/creations">Creations</Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/"
            className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
            target="_blank"
          >
            Open Site
          </Link>

          <form action={adminLogout}>
            <button
              type="submit"
              className="rounded bg-black text-white px-3 py-2 text-sm"
            >
              Logout
            </button>
          </form>
        </div>
      </header>

      <main className="p-6">{children}</main>
    </div>
  );
}