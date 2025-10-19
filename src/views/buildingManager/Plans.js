// ===== src/views/buildingManager/Plans.js =====
// نمایش پکیج‌ها با قیمت‌گذاری «بر اساس تعداد واحد»
// - لیست پکیج‌ها:  GET /public/plans  (عنوان/ویژگی‌ها)
// - قیمت هر پکیج:  POST /v1/building_manager/proforma/preview  (محاسبه واقعی واحدی)
// نکته: این صفحه در پنل مدیرساختمان است، پس توکن باید در localStorage باشد.

import React from "react";
import axios from "axios";
import RentAddonCard from "../../components/buildingManager/features/RentAddonCard";
// ===== تنظیمات و ثابت‌ها =====
// اگر فرانت و بک‌اند روی دامنه جدا هستند، VITE_API_BASE_URL را در زمان بیلد ست کن
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

// دوره‌های قابل انتخاب
const PERIODS = [
  { key: "monthly", label: "ماهانه" },
  { key: "quarterly", label: "سه‌ماهه" },
  { key: "yearly", label: "سالانه" },
];

// فرمت ساده اعداد
const nf = (n) => (typeof n === "number" ? n.toLocaleString("fa-IR") : "—");

// ساخت کلاینت axios با baseURL (در صورت نیاز)
const http = axios.create({
  baseURL: API_BASE,
});

// اینترسپتور ساده برای هدر Authorization
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function Plans() {
  // ===== وضعیت‌ها =====
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [plans, setPlans] = React.useState([]); // [{slug,title,features:[]}, ...]
  const [features, setFeatures] = React.useState([]); // لیست یکتا از همهٔ ویژگی‌ها
  const [period, setPeriod] = React.useState("monthly"); // دورهٔ فعال
  const [priceMap, setPriceMap] = React.useState({}); // { [slug]: { total, currency } }
  const [priceLoading, setPriceLoading] = React.useState(false);

  // ===== دریافت لیست پکیج‌ها از API عمومی =====
  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    http
      .get("/public/plans")
      .then(({ data }) => {
        const list = Array.isArray(data?.data?.plans) ? data.data.plans : [];
        if (!mounted) return;

        setPlans(list);

        // استخراج لیست یکتای ویژگی‌ها برای جدول مقایسه
        const fset = new Set();
        list.forEach((p) => (p.features || []).forEach((f) => fset.add(f)));
        setFeatures(Array.from(fset));
      })
      .catch((e) => {
        setError(
          e?.response?.data?.message ||
            e?.message ||
            "خطا در دریافت لیست پکیج‌ها"
        );
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // ===== هر بار که لیست پکیج‌ها آماده شد یا دوره عوض شد → قیمت‌های واقعی را از preview بگیر =====
  React.useEffect(() => {
    if (!plans.length) return;

    let mounted = true;
    setPriceLoading(true);

    // برای هر پکیج یک درخواست preview می‌زنیم
    Promise.all(
      plans.map((p) =>
        http
          .post("/v1/building_manager/proforma/preview", {
            package_slug: p.slug,
            period: period,
            discount: 0,
            tax_percent: 0,
          })
          .then(({ data }) => {
            const d = data?.data;
            return { slug: p.slug, total: d?.total ?? null, currency: d?.currency ?? "IRR" };
          })
          .catch(() => ({ slug: p.slug, total: null, currency: "IRR" }))
      )
    )
      .then((rows) => {
        if (!mounted) return;
        const map = {};
        rows.forEach((r) => (map[r.slug] = { total: r.total, currency: r.currency }));
        setPriceMap(map);
      })
      .finally(() => {
        if (mounted) setPriceLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [plans, period]);

  // ===== هندل کلیک خرید =====
  const handleBuy = async (pkgSlug) => {
    // اینجا فقط نمونه نشان می‌دهیم. اگر flow خرید دارید، همان را صدا بزنید.
    // پیشنهاد: ابتدا یک پیش‌فاکتور واقعی بسازید و سپس به صفحهٔ فاکتور/درگاه بروید.
    try {
      const { data } = await http.post("/v1/building_manager/proforma", {
        package_slug: pkgSlug,
        period,
        discount: 0,
        tax_percent: 0,
      });
      const id = data?.data?.id;
      if (id) {
        // مثلا نمایش HTML فاکتور
        window.open(`${API_BASE}/v1/building_manager/proforma/${id}/html`, "_blank");
      } else {
        alert("پیش‌فاکتور ساخته شد اما شناسه‌ای برنگشت.");
      }
    } catch (e) {
      alert("خطا در ساخت پیش‌فاکتور. دوباره تلاش کنید.");
    }
  };

  // ===== UI =====
  if (loading) return <div>در حال بارگذاری پکیج‌ها…</div>;
  if (error) return <div style={{ color: "crimson" }}>{error}</div>;
  if (!plans.length) return <div>هیچ پکیجی یافت نشد.</div>;

  return (
    <div style={{ padding: 16 }}>
      {/* انتخاب دوره */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #ddd",
              background: period === p.key ? "#eef" : "#fff",
              cursor: "pointer",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* جدول ویژگی‌ها به‌همراه ستون قیمت واقعی از preview */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>ویژگی‌ها</th>
              {plans.map((p) => (
                <th key={p.slug} style={th}>
                  {p.title || p.slug}
                  <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                    {priceLoading
                      ? "در حال محاسبه…"
                      : priceMap[p.slug]?.total != null
                      ? `قیمت ${PERIODS.find(x => x.key === period)?.label}: ${nf(priceMap[p.slug].total)} ${priceMap[p.slug].currency}`
                      : "در دسترس نیست"}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((f) => (
              <tr key={f}>
                <td style={tdPrimary}>{f}</td>
                {plans.map((p) => (
                  <td key={p.slug + f} style={td}>
                    {(p.features || []).includes(f) ? "✓" : "—"}
                  </td>
                ))}
              </tr>
            ))}
            {/* ردیف دکمهٔ خرید */}
            <tr>
              <td style={tdPrimary}>اقدام</td>
              {plans.map((p) => (
                <td key={p.slug + "-buy"} style={td}>
                  <button
                    onClick={() => handleBuy(p.slug)}
                    disabled={priceMap[p.slug]?.total == null}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "1px solid #bbb",
                      background: "#fff",
                      cursor: priceMap[p.slug]?.total == null ? "not-allowed" : "pointer",
                    }}
                  >
                    خرید {p.title || p.slug}
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 12, color: "#666", fontSize: 12 }}>
        قیمت‌ها توسط سرور و بر اساس تعداد واحدهای مجتمع شما محاسبه می‌شوند.
      </p>
    </div>
  );
}

// ===== سبک‌های سادهٔ جدول =====
const th = {
  border: "1px solid #e5e5e5",
  padding: "10px",
  background: "#fafafa",
  textAlign: "center",
  whiteSpace: "nowrap",
};
const td = {
  border: "1px solid #f0f0f0",
  padding: "8px",
  textAlign: "center",
};
const tdPrimary = {
  ...td,
  textAlign: "right",
  background: "#fcfcfc",
};
<RentAddonCard onActivated={refreshPlans} />