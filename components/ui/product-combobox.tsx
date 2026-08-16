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
            ? "border-[#CC785C] ring-2 ring-[#CC785C]/20"
            : "border-[#E8E4DC] hover:border-[#D6D1C7]",
          disabled && "opacity-50 cursor-not-allowed bg-[#FAF8F5]"
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Package className="w-4 h-4 text-[#CC785C] shrink-0" />
          {selectedProduct ? (
            <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
              <span className="font-semibold text-[#191716] truncate">
                {selectedProduct.name}
              </span>
              {selectedProduct.sku && (
                <span className="px-1.5 py-0.2 rounded bg-[#F5F2EB] text-[#44403C] font-mono text-[10px] shrink-0 font-semibold">
                  {selectedProduct.sku}
                </span>
              )}
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 ${
                  selectedProduct.stock === 0
                    ? "bg-[#FEF2F2] text-[#B91C1C]"
                    : selectedProduct.stock < 5
                    ? "bg-[#FEF8EC] text-[#92400E]"
                    : "bg-[#F0FDF4] text-[#166534]"
                }`}
              >
                Kho: {selectedProduct.stock}
              </span>
              <span className="font-bold text-[#191716] text-xs shrink-0 ml-auto mr-1 tabular-nums">
                {formatCurrency(selectedProduct.price)}
              </span>
            </div>
          ) : (
            <span className="text-[#A8A296] font-medium">-- Tìm và chọn sản phẩm --</span>
          )}
        </div>

        <ChevronDown
          className={cn(
            "w-4 h-4 text-[#A8A296] shrink-0 transition-transform duration-150",
            isOpen && "rotate-180 text-[#CC785C]"
          )}
        />
      </button>

      {/* Popover Dropdown tìm kiếm */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl border border-[#E8E4DC] shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Search Box Input */}
          <div className="p-2 border-b border-[#F5F2EB] bg-[#FAF8F5] relative flex items-center">
            <Search className="w-4 h-4 text-[#A8A296] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Gõ tên hoặc mã SKU để tìm nhanh..."
              className="w-full pl-8 pr-7 py-1.5 text-xs sm:text-sm bg-white rounded-xl border border-[#E8E4DC] focus:outline-none focus:ring-2 focus:ring-[#CC785C]/20 focus:border-[#CC785C] font-medium"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-4 text-[#A8A296] hover:text-[#57534E] p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Product Items List */}
          <div className="max-h-56 overflow-y-auto p-1.5 space-y-1">
            {filteredProducts.length === 0 ? (
              <div className="py-6 text-center text-[#78716C] text-xs font-medium">
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
                      "w-full text-left p-2.5 rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm transition-colors",
                      isSelected
                        ? "bg-[#FAF2EE] text-[#9B5038] font-bold border border-[#F5E4DB]"
                        : "hover:bg-[#FAF8F5] text-[#191716]"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-[#191716] truncate">
                          {product.name}
                        </span>
                        {product.sku && (
                          <span className="px-1.5 py-0.2 rounded bg-[#F5F2EB] text-[#44403C] font-mono text-[10px] font-semibold">
                            {product.sku}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs">
                        <span
                          className={`font-semibold ${
                            isOutOfStock
                              ? "text-[#B91C1C]"
                              : isLowStock
                              ? "text-[#B45309]"
                              : "text-[#15803D]"
                          }`}
                        >
                          {isOutOfStock
                            ? "Hết hàng (0)"
                            : `Còn ${product.stock} cái`}
                        </span>
                        <span className="text-[#D6D1C7]">•</span>
                        <span className="font-bold text-[#191716] tabular-nums">
                          {formatCurrency(product.price)}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-[#CC785C] text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" />
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
