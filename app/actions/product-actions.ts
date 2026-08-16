"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema validation cho Product
const ProductSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm không được để trống"),
  sku: z.string().optional().nullable(),
  price: z.coerce.number().min(0, "Giá bán phải lớn hơn hoặc bằng 0"),
  stock: z.coerce.number().int("Tồn kho phải là số nguyên").min(0, "Số lượng tồn kho không được âm"),
});

export type ProductFormValues = z.infer<typeof ProductSchema>;

/**
 * Lấy danh sách sản phẩm kèm số lượng đơn hàng liên kết
 */
export async function getProducts(options?: {
  search?: string;
  lowStockOnly?: boolean;
}) {
  try {
    const { search, lowStockOnly } = options || {};

    return await prisma.product.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { sku: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
          lowStockOnly ? { stock: { lt: 5 } } : {},
        ],
      },
      include: {
        _count: {
          select: { orderItems: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    throw new Error("Không thể tải danh sách sản phẩm.");
  }
}

/**
 * Lấy chi tiết 1 sản phẩm
 */
export async function getProductById(id: string) {
  try {
    return await prisma.product.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin sản phẩm:", error);
    return null;
  }
}

/**
 * Lấy danh sách tất cả các đơn hàng và khách hàng đã đặt một sản phẩm cụ thể
 */
export async function getProductOrders(productId: string) {
  try {
    return await prisma.product.findUnique({
      where: { id: productId },
      include: {
        orderItems: {
          include: {
            order: {
              include: {
                customer: true,
              },
            },
          },
          orderBy: {
            order: {
              createdAt: "desc",
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử đặt hàng của sản phẩm:", error);
    return null;
  }
}

/**
 * Tạo mới sản phẩm
 */
export async function createProduct(formData: {
  name: string;
  sku?: string | null;
  price: number;
  stock: number;
}) {
  try {
    const validated = ProductSchema.parse(formData);

    // Kiểm tra SKU trùng lặp nếu có
    if (validated.sku && validated.sku.trim() !== "") {
      const existingSku = await prisma.product.findUnique({
        where: { sku: validated.sku.trim() },
      });
      if (existingSku) {
        return { success: false, error: `Mã SKU "${validated.sku}" đã tồn tại trên hệ thống.` };
      }
    }

    const product = await prisma.product.create({
      data: {
        name: validated.name.trim(),
        sku: validated.sku && validated.sku.trim() !== "" ? validated.sku.trim() : null,
        price: validated.price,
        stock: validated.stock,
      },
    });

    revalidatePath("/inventory");
    revalidatePath("/");
    revalidatePath("/orders");
    revalidatePath("/analytics");

    return { success: true, product };
  } catch (error: unknown) {
    console.error("Lỗi khi tạo sản phẩm:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: (error as Error).message || "Không thể tạo sản phẩm." };
  }
}

/**
 * Cập nhật thông tin sản phẩm
 */
export async function updateProduct(
  id: string,
  formData: {
    name: string;
    sku?: string | null;
    price: number;
    stock: number;
  }
) {
  try {
    const validated = ProductSchema.parse(formData);

    // Kiểm tra trùng SKU với sản phẩm khác
    if (validated.sku && validated.sku.trim() !== "") {
      const existingSku = await prisma.product.findUnique({
        where: { sku: validated.sku.trim() },
      });
      if (existingSku && existingSku.id !== id) {
        return { success: false, error: `Mã SKU "${validated.sku}" đã được sử dụng bởi sản phẩm khác.` };
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: validated.name.trim(),
        sku: validated.sku && validated.sku.trim() !== "" ? validated.sku.trim() : null,
        price: validated.price,
        stock: validated.stock,
      },
    });

    revalidatePath("/inventory");
    revalidatePath("/");
    revalidatePath("/orders");
    revalidatePath("/analytics");

    return { success: true, product };
  } catch (error: unknown) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: (error as Error).message || "Không thể cập nhật sản phẩm." };
  }
}

/**
 * Chỉnh sửa nhanh số lượng tồn kho và giá bán
 */
export async function updateStockAndPrice(
  id: string,
  data: { stock: number; price: number }
) {
  try {
    const schema = z.object({
      stock: z.coerce.number().int().min(0, "Tồn kho không được âm"),
      price: z.coerce.number().min(0, "Giá bán không được âm"),
    });

    const validated = schema.parse(data);

    const product = await prisma.product.update({
      where: { id },
      data: {
        stock: validated.stock,
        price: validated.price,
      },
    });

    revalidatePath("/inventory");
    revalidatePath("/");
    revalidatePath("/orders");
    revalidatePath("/analytics");

    return { success: true, product };
  } catch (error: unknown) {
    console.error("Lỗi khi điều chỉnh tồn kho & giá:", error);
    return {
      success: false,
      error: (error as Error).message || "Không thể cập nhật tồn kho.",
    };
  }
}

/**
 * Xóa sản phẩm (Kiểm tra nếu sản phẩm đã phát sinh đơn hàng)
 */
export async function deleteProduct(id: string) {
  try {
    const orderItemCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderItemCount > 0) {
      return {
        success: false,
        error: `Không thể xóa sản phẩm này vì đã có ${orderItemCount} đơn hàng liên kết. Bạn có thể chỉnh tồn kho về 0 thay vì xóa.`,
      };
    }

    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/inventory");
    revalidatePath("/");
    revalidatePath("/analytics");
    return { success: true };
  } catch (error: unknown) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    return { success: false, error: (error as Error).message || "Không thể xóa sản phẩm." };
  }
}
