import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AdminGuard } from "@/features/auth/AdminGuard";
import { AdminLayout } from "@/pages/admin/AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";

const LandingPage = lazy(() =>
  import("@/pages/public/LandingPage").then((m) => ({ default: m.LandingPage })),
);
const ProductDetailPage = lazy(() =>
  import("@/pages/public/ProductDetailPage").then((m) => ({ default: m.ProductDetailPage })),
);
const CheckoutPage = lazy(() =>
  import("@/pages/public/CheckoutPage").then((m) => ({ default: m.CheckoutPage })),
);
const OrderSuccessPage = lazy(() =>
  import("@/pages/public/OrderSuccessPage").then((m) => ({ default: m.OrderSuccessPage })),
);
const OrderStatusPage = lazy(() =>
  import("@/pages/public/OrderStatusPage").then((m) => ({ default: m.OrderStatusPage })),
);
const AdminLoginPage = lazy(() =>
  import("@/pages/admin/AdminLoginPage").then((m) => ({ default: m.AdminLoginPage })),
);
const AdminDashboardPage = lazy(() =>
  import("@/pages/admin/AdminDashboardPage").then((m) => ({ default: m.AdminDashboardPage })),
);
const AdminPagesPage = lazy(() =>
  import("@/pages/admin/AdminPagesPage").then((m) => ({ default: m.AdminPagesPage })),
);
const AdminProductsPage = lazy(() =>
  import("@/pages/admin/AdminProductsPage").then((m) => ({ default: m.AdminProductsPage })),
);
const AdminProductEditPage = lazy(() =>
  import("@/pages/admin/AdminProductEditPage").then((m) => ({ default: m.AdminProductEditPage })),
);
const AdminPromotionsPage = lazy(() =>
  import("@/pages/admin/AdminPromotionsPage").then((m) => ({ default: m.AdminPromotionsPage })),
);
const AdminPromotionEditPage = lazy(() =>
  import("@/pages/admin/AdminPromotionEditPage").then((m) => ({ default: m.AdminPromotionEditPage })),
);
const AdminFaqsPage = lazy(() =>
  import("@/pages/admin/AdminFaqsPage").then((m) => ({ default: m.AdminFaqsPage })),
);
const AdminOrdersPage = lazy(() =>
  import("@/pages/admin/AdminOrdersPage").then((m) => ({ default: m.AdminOrdersPage })),
);
const AdminOrderDetailPage = lazy(() =>
  import("@/pages/admin/AdminOrderDetailPage").then((m) => ({ default: m.AdminOrderDetailPage })),
);
const AdminPaymentsPage = lazy(() =>
  import("@/pages/admin/AdminPaymentsPage").then((m) => ({ default: m.AdminPaymentsPage })),
);
const AdminMediaPage = lazy(() =>
  import("@/pages/admin/AdminMediaPage").then((m) => ({ default: m.AdminMediaPage })),
);
const AdminTestimonialsPage = lazy(() =>
  import("@/pages/admin/AdminTestimonialsPage").then((m) => ({ default: m.AdminTestimonialsPage })),
);
const AdminSettingsPage = lazy(() =>
  import("@/pages/admin/AdminSettingsPage").then((m) => ({ default: m.AdminSettingsPage })),
);
const AdminActivityPage = lazy(() =>
  import("@/pages/admin/AdminActivityPage").then((m) => ({ default: m.AdminActivityPage })),
);

function PageLoader() {
  return (
    <div className="p-8">
      <Skeleton className="mb-4 h-10 w-1/3" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="products/:slug" element={<ProductDetailPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="order-success/:id" element={<OrderSuccessPage />} />
            <Route path="order-status/:reference" element={<OrderStatusPage />} />
          </Route>

          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<AdminGuard />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="pages" element={<AdminPagesPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="products/new" element={<AdminProductEditPage />} />
              <Route path="products/:id" element={<AdminProductEditPage />} />
              <Route path="categories" element={<Navigate to="/admin/products" replace />} />
              <Route path="promotions" element={<AdminPromotionsPage />} />
              <Route path="promotions/new" element={<AdminPromotionEditPage />} />
              <Route path="promotions/:id" element={<AdminPromotionEditPage />} />
              <Route path="faqs" element={<AdminFaqsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="orders/:id" element={<AdminOrderDetailPage />} />
              <Route path="payments" element={<AdminPaymentsPage />} />
              <Route path="media" element={<AdminMediaPage />} />
              <Route path="testimonials" element={<AdminTestimonialsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="activity" element={<AdminActivityPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
