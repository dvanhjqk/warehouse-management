"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CustomerSchema = z.object({
  name: z.string().min(1, "Họ và tên khách hàng không được để trống"),
  phone: z.string().min(8, "Số điện thoại phải có ít nhất 8 chữ số"),
  address: z.string().optional().nullable(),
});

export type CustomerFormValues = z.infer<typeof CustomerSchema>;

/**
 * Lấy danh sách khách hàng kèm số lượng đơn và lịch sử đơn
 */
export async function getCustomers(search?: string) {
  try {
    return await prisma.customer.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
              { address: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
      include: {
        orders: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách khách hàng:", error);
    throw new Error("Không thể tải danh sách khách hàng.");
  }
}

/**
 * Lấy thông tin chi tiết một khách hàng kèm lịch sử mua hàng
 */
export async function getCustomerById(id: string) {
  try {
    return await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin khách hàng:", error);
    return null;
  }
}

/**
 * Tạo mới khách hàng
 */
export async function createCustomer(data: CustomerFormValues) {
  try {
    const validated = CustomerSchema.parse(data);

    // Kiểm tra số điện thoại
    const existing = await prisma.customer.findFirst({
      where: { phone: validated.phone.trim() },
    });

    if (existing) {
      return {
        success: false,
        error: `Số điện thoại "${validated.phone}" đã thuộc về khách hàng ${existing.name}.`,
      };
    }

    const customer = await prisma.customer.create({
      data: {
        name: validated.name.trim(),
        phone: validated.phone.trim(),
        address: validated.address?.trim() || null,
      },
    });

    revalidatePath("/customers");
    revalidatePath("/orders");

    return { success: true, customer };
  } catch (error: unknown) {
    console.error("Lỗi khi tạo khách hàng:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: (error as Error).message || "Không thể tạo khách hàng." };
  }
}

/**
 * Cập nhật thông tin khách hàng
 */
export async function updateCustomer(id: string, data: CustomerFormValues) {
  try {
    const validated = CustomerSchema.parse(data);

    const existing = await prisma.customer.findFirst({
      where: { phone: validated.phone.trim() },
    });

    if (existing && existing.id !== id) {
      return {
        success: false,
        error: `Số điện thoại "${validated.phone}" đã thuộc về khách hàng khác (${existing.name}).`,
      };
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name: validated.name.trim(),
        phone: validated.phone.trim(),
        address: validated.address?.trim() || null,
      },
    });

    revalidatePath("/customers");
    revalidatePath("/orders");

    return { success: true, customer };
  } catch (error: unknown) {
    console.error("Lỗi khi cập nhật thông tin khách hàng:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: (error as Error).message || "Không thể cập nhật khách hàng." };
  }
}

/**
 * Xóa khách hàng (kèm kiểm tra đơn hàng)
 */
export async function deleteCustomer(id: string) {
  try {
    const orderCount = await prisma.order.count({
      where: { customerId: id },
    });

    if (orderCount > 0) {
      return {
        success: false,
        error: `Không thể xóa khách hàng này vì đã có ${orderCount} đơn hàng liên kết.`,
      };
    }

    await prisma.customer.delete({
      where: { id },
    });

    revalidatePath("/customers");
    revalidatePath("/orders");

    return { success: true };
  } catch (error: unknown) {
    console.error("Lỗi khi xóa khách hàng:", error);
    return { success: false, error: (error as Error).message || "Không thể xóa khách hàng." };
  }
}
