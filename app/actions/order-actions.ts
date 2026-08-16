"use server";

import prisma from "@/lib/prisma";
import { OrderStatus, Order, Customer, OrderItem, Product } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema validation khi tạo đơn hàng
const CreateOrderSchema = z.object({
  customerId: z.string().optional(),
  newCustomer: z
    .object({
      name: z.string().min(1, "Tên khách hàng không được để trống"),
      phone: z.string().min(8, "Số điện thoại không hợp lệ"),
      address: z.string().optional().nullable(),
    })
    .optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Vui lòng chọn sản phẩm"),
        quantity: z.coerce.number().int().min(1, "Số lượng phải lớn hơn 0"),
        price: z.coerce.number().min(0, "Giá bán không được âm"),
      })
    )
    .min(1, "Đơn hàng phải có ít nhất 1 sản phẩm"),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

// Schema validation khi chỉnh sửa đơn hàng đang ở trạng thái PENDING
const UpdateOrderSchema = z.object({
  orderId: z.string().min(1, "Thiếu mã đơn hàng"),
  customerId: z.string().min(1, "Vui lòng chọn khách hàng"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Vui lòng chọn sản phẩm"),
        quantity: z.coerce.number().int().min(1, "Số lượng phải lớn hơn 0"),
        price: z.coerce.number().min(0, "Giá bán không được âm"),
      })
    )
    .min(1, "Đơn hàng phải có ít nhất 1 sản phẩm"),
});

export type UpdateOrderInput = z.infer<typeof UpdateOrderSchema>;

export type OrderActionResult =
  | {
      success: true;
      order: Order & {
        customer?: Customer;
        items?: (OrderItem & { product?: Product })[];
      };
    }
  | { success: false; error: string };

/**
 * Lấy danh sách đơn hàng kèm quan hệ Customer, OrderItem & Product
 */
export async function getOrders(options?: {
  status?: OrderStatus | "ALL";
  search?: string;
}) {
  try {
    const { status, search } = options || {};

    return await prisma.order.findMany({
      where: {
        AND: [
          status && status !== "ALL" ? { status: status as OrderStatus } : {},
          search
            ? {
                OR: [
                  { id: { contains: search, mode: "insensitive" } },
                  { customer: { name: { contains: search, mode: "insensitive" } } },
                  { customer: { phone: { contains: search, mode: "insensitive" } } },
                ],
              }
            : {},
        ],
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    return [];
  }
}

/**
 * Lấy chi tiết 1 đơn hàng
 */
export async function getOrderById(id: string) {
  try {
    return await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
    return null;
  }
}

/**
 * Tạo mới đơn hàng thủ công
 */
export async function createOrder(input: CreateOrderInput): Promise<OrderActionResult> {
  try {
    const validated = CreateOrderSchema.parse(input);

    const createdOrder = await prisma.$transaction(async (tx) => {
      let finalCustomerId = validated.customerId;

      // Nếu người dùng nhập thông tin khách hàng mới
      if (!finalCustomerId) {
        if (!validated.newCustomer) {
          throw new Error("Vui lòng chọn khách hàng hoặc nhập thông tin khách mới.");
        }

        // Tìm xem SĐT đã tồn tại chưa, nếu có thì dùng lại
        const existingCustomer = await tx.customer.findFirst({
          where: { phone: validated.newCustomer.phone.trim() },
        });

        if (existingCustomer) {
          finalCustomerId = existingCustomer.id;
          // Cập nhật tên/địa chỉ nếu có thay đổi
          await tx.customer.update({
            where: { id: existingCustomer.id },
            data: {
              name: validated.newCustomer.name.trim(),
              address: validated.newCustomer.address?.trim() || existingCustomer.address,
            },
          });
        } else {
          const newCust = await tx.customer.create({
            data: {
              name: validated.newCustomer.name.trim(),
              phone: validated.newCustomer.phone.trim(),
              address: validated.newCustomer.address?.trim() || null,
            },
          });
          finalCustomerId = newCust.id;
        }
      }

      // Tính tổng tiền đơn hàng
      const totalAmount = validated.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Tạo đơn hàng kèm các OrderItems
      return await tx.order.create({
        data: {
          customerId: finalCustomerId,
          status: OrderStatus.PENDING,
          totalAmount,
          items: {
            create: validated.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          customer: true,
          items: {
            include: { product: true },
          },
        },
      });
    });

    revalidatePath("/orders");
    revalidatePath("/inventory");
    revalidatePath("/customers");
    revalidatePath("/");
    revalidatePath("/analytics");

    return { success: true, order: createdOrder };
  } catch (error: unknown) {
    console.error("Lỗi khi tạo đơn hàng:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: (error as Error).message || "Không thể tạo đơn hàng." };
  }
}

/**
 * Chỉnh sửa đơn hàng (Chỉ áp dụng khi đơn hàng ở trạng thái PENDING)
 */
export async function updateOrder(input: UpdateOrderInput): Promise<OrderActionResult> {
  try {
    const validated = UpdateOrderSchema.parse(input);

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Kiểm tra đơn hàng hiện tại
      const order = await tx.order.findUnique({
        where: { id: validated.orderId },
        include: { items: true },
      });

      if (!order) {
        throw new Error("Không tìm thấy đơn hàng cần chỉnh sửa.");
      }

      // Kiểm tra trạng thái đơn: chỉ cho phép sửa khi PENDING
      if (order.status !== OrderStatus.PENDING) {
        throw new Error(
          `Chỉ có thể chỉnh sửa đơn hàng khi đang ở trạng thái "Đang xử lý" (PENDING). Đơn này hiện đang ở trạng thái "${order.status}".`
        );
      }

      // 2. Tính lại tổng tiền mới
      const totalAmount = validated.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // 3. Xóa các mặt hàng cũ trong đơn và chèn lại các mặt hàng mới cập nhật
      await tx.orderItem.deleteMany({
        where: { orderId: validated.orderId },
      });

      return await tx.order.update({
        where: { id: validated.orderId },
        data: {
          customerId: validated.customerId,
          totalAmount,
          items: {
            create: validated.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          customer: true,
          items: {
            include: { product: true },
          },
        },
      });
    });

    revalidatePath("/orders");
    revalidatePath("/inventory");
    revalidatePath("/customers");
    revalidatePath("/");
    revalidatePath("/analytics");

    return { success: true, order: updatedOrder };
  } catch (error: unknown) {
    console.error("Lỗi khi chỉnh sửa đơn hàng:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: (error as Error).message || "Không thể cập nhật đơn hàng." };
  }
}

/**
 * Xử lý cập nhật trạng thái đơn hàng (Sử dụng Prisma Transaction)
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<OrderActionResult> {
  try {
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Lấy đơn hàng hiện tại kèm danh sách sản phẩm và thông tin kho
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        throw new Error("Không tìm thấy đơn hàng trên hệ thống.");
      }

      // Nếu trạng thái không thay đổi thì bỏ qua
      if (order.status === newStatus) {
        return order;
      }

      const previousStatus = order.status;

      // 2. Chuyển sang DELIVERED từ trạng thái chưa DELIVERED -> Kiểm tra & Trừ kho
      if (newStatus === OrderStatus.DELIVERED && previousStatus !== OrderStatus.DELIVERED) {
        // Kiểm tra tồn kho toàn bộ sản phẩm trong đơn trước khi trừ
        for (const item of order.items) {
          if (item.product.stock < item.quantity) {
            throw new Error(
              `Sản phẩm "${item.product.name}" không đủ số lượng tồn kho! (Tồn kho hiện tại: ${item.product.stock}, Đơn hàng yêu cầu: ${item.quantity}). Vui lòng nhập thêm hàng trước khi hoàn tất giao hàng.`
            );
          }
        }

        // Thực hiện trừ kho từng sản phẩm
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      // 3. Đơn đã DELIVERED trước đó nhưng bị đổi sang CANCELLED hoặc PENDING/SHIPPING -> Hoàn kho
      if (previousStatus === OrderStatus.DELIVERED && newStatus !== OrderStatus.DELIVERED) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      // 4. Cập nhật trạng thái đơn hàng
      return await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus },
        include: {
          customer: true,
          items: {
            include: { product: true },
          },
        },
      });
    });

    revalidatePath("/orders");
    revalidatePath("/inventory");
    revalidatePath("/customers");
    revalidatePath("/");
    revalidatePath("/analytics");

    return { success: true, order: updatedOrder };
  } catch (error: unknown) {
    console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
    return {
      success: false,
      error: (error as Error).message || "Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.",
    };
  }
}

/**
 * Xóa đơn hàng
 */
export async function deleteOrder(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!order) throw new Error("Không tìm thấy đơn hàng");

      // Nếu đơn hàng đã giao (DELIVERED) bị xóa -> Hoàn lại tồn kho
      if (order.status === OrderStatus.DELIVERED) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
            },
          });
        }
      }

      await tx.order.delete({
        where: { id },
      });
    });

    revalidatePath("/orders");
    revalidatePath("/inventory");
    revalidatePath("/customers");
    revalidatePath("/");
    revalidatePath("/analytics");

    return { success: true };
  } catch (error: unknown) {
    console.error("Lỗi khi xóa đơn hàng:", error);
    return {
      success: false,
      error: (error as Error).message || "Không thể xóa đơn hàng.",
    };
  }
}
