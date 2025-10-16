import React, { useState } from "react";
import { Button, Spinner } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { createProforma } from "@src/api/proforma";

export default function ProformaButton({
  packageSlug,
  period = "monthly",
  buyer,
  className = ""
}) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleClick() {
    try {
      setLoading(true);
      const pf = await createProforma({ package_slug: packageSlug, period, buyer });
      // هدایت به صفحه پریویو (برای چاپ یا لینک PDF)
      navigate(`/proforma/${pf.id}/preview`);
    } catch (e) {
      // اگر toast داری جایگزین کن
      alert("خطا در ایجاد پیش‌فاکتور");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      color="secondary"
      outline
      disabled={loading}
      onClick={handleClick}
      className={`rounded-3 ${className}`}
      title="تولید پیش‌فاکتور و مشاهده چاپ"
    >
      {loading ? (<><Spinner size="sm" className="me-2" /> در حال ایجاد…</>) : "تولید پیش‌فاکتور"}
    </Button>
  );
}
