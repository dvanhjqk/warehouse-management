"use client";

import React, { useState, useRef, useEffect } from "react";
import { Product } from "@prisma/client";
import { formatCurrency, cn } from "@/lib/utils";
import { Search, ChevronDown, Check, Package, X } from "lucide-react";

interface ProductComboboxProps {
  products: Product[];
  value: string;
  onChange: (productId: string) => void;
  disabled?: boolean;
}

export function ProductCombobox({
  products,
  value,
  onChange,
  disabled = false,
}: ProductComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedProduct = products.find((p) => p.id === value);

  // Lọc sản phẩm theo từ khóa tìm kiếm (Tên hoặc SKU)
  const filteredProducts = products.filter((p) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    const nameMatch = p.name.toLowerCase().includes(term);
    const skuMatch = p.sku ? p.sku.toLowerCase().includes(term) : false;
    return nameMatch || skuMatch;
  });

  // Tự động focus vào ô tìm kiếm khi mở popup
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setSearch("");
    }
  }, [isOpen]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Nút bấm hiển thị sản phẩm đã chọn */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-3.5 py-2.5 rounded-2xl border bg-white text-left text-xs sm:text-sm flex items-center justify-between gap-2 transition-all shadow-2xs",
          isOpen
            ? "border-indigo-500 ring-2 ring-indigo-500/20"
            : "border-slate-200 hover:border-slate-300",
          disabled && "opacity-50 cursor-not-allowed bg-slate-50"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Package className="w-4 h-4 text-indigo-500 shrink-0" />
          {selectedProduct ? (
            <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
              <span className="font-bold text-slate-900 truncate">
                {selectedProduct.name}
              </span>
              {selectedProduct.sku && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold shrink-0">
                  {selectedProduct.sku}
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                  selectedProduct.stock === 0
                    ? "bg-rose-100 text-rose-700"
                    : selectedProduct.stock < 5
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                Kho: {selectedProduct.stock}
              </span>
              <span className="font-extrabold text-slate-900 text-xs shrink-0 ml-auto mr-1 tabular-nums">
                {formatCurrency(selectedProduct.price)}
              </span>
            </div>
          ) : (
            <span className="text-slate-400 font-medium">-- Tìm và chọn sản phẩm --</span>
          )}
        </div>

        <ChevronDown
          className={cn(
            "w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180 text-indigo-600"
          )}
        />
      </button>

      {/* Popover Dropdown tìm kiếm */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-3xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Box Input */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/80 relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Gõ tên hoặc mã SKU để tìm nhanh..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-5 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Product Items List */}
          <div className="max-h-60 overflow-y-auto p-2 space-y-1">
            {filteredProducts.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-medium">
                Không tìm thấy sản phẩm nào khớp với &quot;<b>{search}</b>&quot;
              </div>
            ) : (
              filteredProducts.map((product) => {
                const isSelected = product.id === value;
                const isLowStock = product.stock < 5;
                const isOutOfStock = product.stock === 0;

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => {
                      onChange(product.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full text-left p-3 rounded-2xl flex items-center justify-between gap-3 text-xs sm:text-sm transition-all",
                      isSelected
                        ? "bg-indigo-50/90 text-indigo-900 font-bold shadow-2xs border border-indigo-100"
                        : "hover:bg-slate-50 text-slate-800"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 truncate">
                          {product.name}
                        </span>
                        {product.sku && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                            {product.sku}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span
                          className={`font-extrabold ${
                            isOutOfStock
                              ? "text-rose-600"
                              : isLowStock
                              ? "text-amber-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {isOutOfStock
                            ? "Hết hàng (0)"
                            : `Còn ${product.stock} cái`}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="font-extrabold text-slate-900 tabular-nums">
                          {formatCurrency(product.price)}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
