"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Lỗi ứng dụng:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100 shadow-sm">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
        Đã xảy ra lỗi khi tải dữ liệu
      </h2>

      <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md leading-relaxed">
        {error?.message?.includes("connect") || error?.message?.includes("DATABASE_URL")
          ? "Không thể kết nối đến cơ sở dữ liệu Supabase. Vui lòng kiểm tra lại biến môi trường DATABASE_URL và DIRECT_URL trên Vercel."
          : "Có lỗi xảy ra trong quá trình xử lý yêu cầu. Vui lòng thử tải lại trang hoặc kiểm tra cấu hình."}
      </p>

      {error?.digest && (
        <span className="mt-3 px-3 py-1 rounded-lg bg-slate-100 text-slate-500 font-mono text-[11px]">
          Mã lỗi (Digest): {error.digest}
        </span>
      )}

      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Thử tải lại</span>
        </button>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Về trang chủ</span>
        </Link>
      </div>
    </div>
  );
}
