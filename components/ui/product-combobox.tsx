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
          "w-full px-3 py-2 rounded-xl border bg-white text-left text-xs sm:text-sm flex items-center justify-between gap-2 transition-all shadow-2xs",
          isOpen
            ? "border-blue-500 ring-2 ring-blue-500/20"
            : "border-slate-200 hover:border-slate-300",
          disabled && "opacity-50 cursor-not-allowed bg-slate-50"
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Package className="w-4 h-4 text-slate-400 shrink-0" />
          {selectedProduct ? (
            <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
              <span className="font-bold text-slate-900 truncate">
                {selectedProduct.name}
              </span>
              {selectedProduct.sku && (
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] shrink-0">
                  {selectedProduct.sku}
                </span>
              )}
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                  selectedProduct.stock === 0
                    ? "bg-rose-100 text-rose-700"
                    : selectedProduct.stock < 5
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                Kho: {selectedProduct.stock}
              </span>
              <span className="font-semibold text-slate-700 text-xs shrink-0 ml-auto mr-1">
                {formatCurrency(selectedProduct.price)}
              </span>
            </div>
          ) : (
            <span className="text-slate-400">-- Tìm và chọn sản phẩm --</span>
          )}
        </div>

        <ChevronDown
          className={cn(
            "w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180 text-blue-600"
          )}
        />
      </button>

      {/* Popover Dropdown tìm kiếm */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Box Input */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/70 relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Gõ tên hoặc mã SKU để tìm nhanh..."
              className="w-full pl-8 pr-7 py-1.5 text-xs sm:text-sm bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-4 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Product Items List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
            {filteredProducts.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
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
                      "w-full text-left p-2.5 rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm transition-all",
                      isSelected
                        ? "bg-blue-50/80 text-blue-900 font-semibold"
                        : "hover:bg-slate-50 text-slate-800"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 truncate">
                          {product.name}
                        </span>
                        {product.sku && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                            {product.sku}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span
                          className={`font-semibold ${
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
                        <span className="font-bold text-slate-800">
                          {formatCurrency(product.price)}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
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
