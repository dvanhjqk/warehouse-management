import { PrismaClient, OrderStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu tạo dữ liệu mẫu (Seeding data)...");

  // Xóa sạch dữ liệu cũ để tránh trùng lặp khi re-seed
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();

  // 1. Tạo danh sách Khách hàng mẫu
  const customer1 = await prisma.customer.create({
    data: {
      name: "Nguyễn Văn An",
      phone: "0901234567",
      address: "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: "Trần Thị Mai",
      phone: "0987654321",
      address: "45 Lê Lợi, Phường Tràng Tiền, Quận Hoàn Kiếm, Hà Nội",
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: "Lê Hoàng Phúc",
      phone: "0918273645",
      address: "88 Hùng Vương, Phường Phú Nhuận, TP. Huế",
    },
  });

  const customer4 = await prisma.customer.create({
    data: {
      name: "Phạm Thu Hà",
      phone: "0934567890",
      address: "12 Trần Hưng Đạo, Phường 1, TP. Vũng Tàu",
    },
  });

  // 2. Tạo danh sách Sản phẩm mẫu
  const product1 = await prisma.product.create({
    data: {
      name: "Tai Nghe Bluetooth ANC Pro Max",
      sku: "AUDIO-PRO-01",
      price: 1450000,
      stock: 25,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: "Bàn Phím Cơ Không Dây Tri-mode 87 Phím",
      sku: "KB-MECH-87",
      price: 890000,
      stock: 14,
    },
  });

  const product3 = await prisma.product.create({
    data: {
      name: "Chuột Gaming Không Dây Siêu Nhẹ 55g",
      sku: "MOUSE-GAM-55",
      price: 650000,
      stock: 3, // Cảnh báo hàng sắp hết kho (< 5)
    },
  });

  const product4 = await prisma.product.create({
    data: {
      name: "Củ Sạc Nhanh GaN 65W 3 Cổng Type-C",
      sku: "CHARG-GAN-65",
      price: 320000,
      stock: 4, // Cảnh báo hàng sắp hết kho (< 5)
    },
  });

  const product5 = await prisma.product.create({
    data: {
      name: "Áo Thun Cotton Compact 100% 250gsm",
      sku: "SHIRT-COT-250",
      price: 220000,
      stock: 50,
    },
  });

  const product6 = await prisma.product.create({
    data: {
      name: "Giá Đỡ Laptop Hợp Kim Nhôm Công Thái Học",
      sku: "STAND-ALU-02",
      price: 380000,
      stock: 2, // Cảnh báo hàng sắp hết kho (< 5)
    },
  });

  // 3. Tạo các Đơn hàng mẫu ở các trạng thái khác nhau
  // Đơn 1: Đã giao hàng (DELIVERED) - Tính vào doanh thu
  await prisma.order.create({
    data: {
      customerId: customer1.id,
      status: OrderStatus.DELIVERED,
      totalAmount: 1450000 + 320000, // 1.770.000 VNĐ
      items: {
        create: [
          {
            productId: product1.id,
            quantity: 1,
            price: 1450000,
          },
          {
            productId: product4.id,
            quantity: 1,
            price: 320000,
          },
        ],
      },
    },
  });

  // Đơn 2: Đang giao hàng (SHIPPING)
  await prisma.order.create({
    data: {
      customerId: customer2.id,
      status: OrderStatus.SHIPPING,
      totalAmount: 890000 * 2, // 1.780.000 VNĐ
      items: {
        create: [
          {
            productId: product2.id,
            quantity: 2,
            price: 890000,
          },
        ],
      },
    },
  });

  // Đơn 3: Đang chờ xử lý (PENDING) - Hiển thị trên dashboard
  await prisma.order.create({
    data: {
      customerId: customer3.id,
      status: OrderStatus.PENDING,
      totalAmount: 650000 + 220000 * 2, // 1.090.000 VNĐ
      items: {
        create: [
          {
            productId: product3.id,
            quantity: 1,
            price: 650000,
          },
          {
            productId: product5.id,
            quantity: 2,
            price: 220000,
          },
        ],
      },
    },
  });

  // Đơn 4: Đã hủy (CANCELLED)
  await prisma.order.create({
    data: {
      customerId: customer4.id,
      status: OrderStatus.CANCELLED,
      totalAmount: 380000,
      items: {
        create: [
          {
            productId: product6.id,
            quantity: 1,
            price: 380000,
          },
        ],
      },
    },
  });

  console.log("✅ Seeding hoàn tất thành công!");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi khi seed dữ liệu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
