import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Đang tiến hành xóa sạch toàn bộ dữ liệu mẫu trong cơ sở dữ liệu...");

  // Xóa theo thứ tự ràng buộc khóa ngoại
  const deletedOrderItems = await prisma.orderItem.deleteMany();
  console.log(`- Đã xóa ${deletedOrderItems.count} dòng chi tiết đơn hàng (OrderItem)`);

  const deletedOrders = await prisma.order.deleteMany();
  console.log(`- Đã xóa ${deletedOrders.count} đơn hàng (Order)`);

  const deletedProducts = await prisma.product.deleteMany();
  console.log(`- Đã xóa ${deletedProducts.count} sản phẩm (Product)`);

  const deletedCustomers = await prisma.customer.deleteMany();
  console.log(`- Đã xóa ${deletedCustomers.count} khách hàng (Customer)`);

  console.log("✨ Đã dọn dẹp sạch toàn bộ dữ liệu thành công! Kho hàng và đơn hàng hiện đang trống và sẵn sàng sử dụng.");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi khi xóa dữ liệu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
