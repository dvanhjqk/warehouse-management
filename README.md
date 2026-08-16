# 📦 MiniKho Pro - Warehouse & Order Management System

Hệ thống web quản lý kho và bán hàng thu nhỏ dành riêng cho người bán hàng online cá nhân. Ứng dụng được xây dựng trên nền tảng **Next.js 15+ (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, kết nối **PostgreSQL (Supabase)** và tối ưu hóa hoàn hảo để triển khai lên **Vercel**.

---

## 🚀 1. Tech Stack
- **Framework**: Next.js 15+ (App Router, Server Actions, React 19, TypeScript)
- **Database & ORM**: Supabase PostgreSQL + Prisma ORM (Hỗ trợ Connection Pooling & Direct URL)
- **Styling**: Tailwind CSS + Lucide React Icons (Modern Clean Slate UI, Responsive)
- **Validation**: Zod + Next.js Server Actions

---

## 🌟 2. Các Tính Năng Chính

### A. Dashboard Tổng quan (`/`)
- **4 Thẻ thống kê KPI thời gian thực**:
  1. Tổng số mặt hàng đang có trong kho.
  2. Số lượng đơn hàng đang chờ xử lý (`PENDING`).
  3. Cảnh báo mặt hàng sắp hết kho (`tồn kho < 5`).
  4. Tổng doanh thu thực tế được tính từ các đơn hàng **Đã giao hàng** (`DELIVERED`).
- Bảng cảnh báo danh sách sản phẩm sắp hết kho kèm cảnh báo màu trực quan.
- Bảng danh sách các đơn hàng mới tạo gần nhất kèm trạng thái và thời gian.

### B. Quản lý Kho Hàng (`/inventory`)
- Bảng danh sách hàng hóa: Tên sản phẩm, Mã SKU, Giá bán niêm yết, Số lượng tồn kho.
- Tìm kiếm tức thời theo Tên hoặc Mã SKU.
- Lọc nhanh các mặt hàng sắp hết kho (`stock < 5`) hoặc hết hàng (`stock = 0`).
- Modal thêm mới sản phẩm và modal chỉnh sửa nhanh tồn kho / giá bán.

### C. Quản lý Đơn Hàng & Logic Trừ Kho (`/orders`)
- Danh sách đơn hàng với các bộ lọc trạng thái: `Tất cả`, `Đang xử lý (PENDING)`, `Đang giao hàng (SHIPPING)`, `Đã giao hàng (DELIVERED)`, `Đã hủy (CANCELLED)`.
- Modal tạo đơn hàng linh hoạt:
  - Chọn khách hàng có sẵn từ danh bạ hoặc nhập nhanh thông tin khách mới (Tên, SĐT, Địa chỉ).
  - Chọn một hoặc nhiều dòng sản phẩm, tự động hiển thị tồn kho hiện tại và đơn giá.
  - Tự động tính toán tổng tiền đơn hàng `totalAmount`.
- **Logic Trừ Kho An Toàn (Prisma Transaction)**:
  - Khi chuyển trạng thái đơn sang `DELIVERED`, hệ thống kiểm tra tồn kho từng sản phẩm trong đơn.
  - Nếu đủ hàng: Tự động giảm `stock` của từng sản phẩm trong bảng `Product`.
  - Nếu thiếu hàng: Hệ thống **ngay lập tức ném lỗi chi tiết** (ví dụ: *Sản phẩm "Chuột Gaming" không đủ số lượng tồn kho (Còn: 3, Cần: 5)*) và **không cho phép chuyển trạng thái**.
  - Nếu đơn hàng đã giao (`DELIVERED`) bị hủy (`CANCELLED`), hệ thống tự động hoàn lại tồn kho cho sản phẩm.
  - Tự động làm mới giao diện ngay lập tức thông qua `revalidatePath`.

### D. Quản lý Khách Hàng (`/customers`)
- Danh bạ khách hàng kèm SĐT, địa chỉ nhận hàng và ngày tham gia.
- Thống kê tổng số đơn đã đặt và tổng chi tiêu thực tế của từng khách.
- Modal xem chi tiết toàn bộ lịch sử các đơn hàng mà khách đã từng đặt.

---

## 🛠️ 3. Hướng Dẫn Cài Đặt & Khởi Chạy

### Bước 1: Clone hoặc mở thư mục dự án
```bash
cd D:\warehouse-management
```

### Bước 2: Cài đặt thư viện phụ thuộc
```bash
npm install
```

### Bước 3: Cấu hình biến môi trường Supabase
Tạo file `.env` từ file mẫu `.env.example`:
```bash
cp .env.example .env
```
Mở file `.env` và điền chuỗi kết nối từ Supabase Dashboard:
*(Vào Supabase Dashboard -> Chọn Project -> **Project Settings** -> **Database** -> **Connection string**)*:
```env
# Mode: Transaction (Port 6543) - Dành cho Serverless
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Mode: Session / Direct (Port 5432) - Dành cho Prisma CLI
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

### Bước 4: Đồng bộ Schema lên Supabase & Seed dữ liệu mẫu
```bash
# Đẩy schema lên database Supabase
npx prisma db push

# Chạy seed dữ liệu mẫu (sản phẩm, khách hàng, đơn hàng)
npx prisma db seed
```

### Bước 5: Khởi động môi trường phát triển
```bash
npm run dev
```
Mở trình duyệt và truy cập: [http://localhost:3000](http://localhost:3000)

---

## 🌐 4. Hướng Dẫn Deploy Lên Vercel

1. Đẩy mã nguồn lên GitHub/GitLab.
2. Truy cập [Vercel](https://vercel.com) và Import repository.
3. Trong phần **Environment Variables**, thêm 2 biến:
   - `DATABASE_URL`: Chuỗi kết nối Supabase Transaction Pooler (Port 6543).
   - `DIRECT_URL`: Chuỗi kết nối Supabase Direct (Port 5432).
4. Nhấn **Deploy**. Quá trình build sẽ tự động chạy `prisma generate` và hoàn tất trong vài chục giây.

---

## 📁 5. Cấu Trúc Thư Mục Chuẩn Next.js 15
```
├── app/
│   ├── layout.tsx             # Root layout với responsive sidebar
│   ├── page.tsx               # Dashboard (/)
│   ├── inventory/page.tsx     # Quản lý kho (/inventory)
│   ├── orders/page.tsx        # Quản lý đơn hàng (/orders)
│   ├── customers/page.tsx     # Quản lý khách hàng (/customers)
│   └── actions/               # Server Actions (CRUD & Transaction)
│       ├── product-actions.ts
│       ├── order-actions.ts
│       ├── customer-actions.ts
│       └── dashboard-actions.ts
├── components/                # UI Components tái sử dụng
│   ├── layout/                # Sidebar, Header, AppLayoutShell
│   ├── inventory/             # InventoryTable, ProductModal, StockModal
│   ├── orders/                # OrdersTable, CreateOrderModal, OrderStatusSelect, OrderDetailModal
│   ├── customers/             # CustomersTable, CustomerModal, CustomerHistoryModal
│   └── ui/                    # StatCard, Badge, Modal
├── lib/
│   ├── prisma.ts              # Prisma Client singleton
│   └── utils.ts               # Currency formatting, date helper, status config
├── prisma/
│   ├── schema.prisma          # Database schema (PostgreSQL)
│   └── seed.ts                # Seed script dữ liệu mẫu
└── .env.example
```
