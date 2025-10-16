import React, { useEffect, useState } from "react";
import { Button, Card, CardBody } from "reactstrap";
import { useParams } from "react-router-dom";
import axios from "axios";

function fmt(n) {
  try { return new Intl.NumberFormat("fa-IR").format(n); } catch { return String(n); }
}

export default function ProformaPreview() {
  const { id } = useParams();
  const [pf, setPf] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await axios.get(`/v1/proforma/${id}`);
        if (alive) setPf(data?.data || null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  if (loading) return <div className="p-3">در حال بارگذاری…</div>;
  if (!pf) return <div className="p-3">یافت نشد</div>;

  const apiBase = import.meta.env.VITE_API_BASE_URL ?? "";

  return (
    <div className="container py-3" dir="rtl">
      <Card className="shadow-sm border-0">
        <CardBody>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="m-0">پیش‌فاکتور <span className="text-warning">{pf.proforma_number}</span></h5>
            <div className="d-print-none">
              <a
                className="btn btn-outline-secondary me-2"
                href={`${apiBase}/v1/proforma/${pf.id}/pdf`}
                target="_blank"
                rel="noreferrer"
              >
                PDF
              </a>
              <Button color="secondary" outline onClick={() => window.print()}>چاپ</Button>
            </div>
          </div>

          <div className="row g-2 mt-2">
            <div className="col-md-6">
              <div className="p-2 rounded" style={{background:"#15171b", color:"#ddd", border:"1px solid #2b2b2f"}}>
                <div className="small text-muted mb-1">فروشنده</div>
                <div>{pf.seller_meta?.brand || "ChargePal"}</div>
                <div className="small text-muted">{pf.seller_meta?.website} | {pf.seller_meta?.phone}</div>
                <div className="small text-muted">{pf.seller_meta?.address}</div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="p-2 rounded" style={{background:"#15171b", color:"#ddd", border:"1px solid #2b2b2f"}}>
                <div className="small text-muted mb-1">خریدار</div>
                <div>{pf.buyer_meta?.name || "بدون نام"}</div>
                <div className="small text-muted">{pf.buyer_meta?.mobile}</div>
                <div className="small text-muted">{pf.buyer_meta?.address}</div>
              </div>
            </div>
          </div>

          <div className="table-responsive mt-3">
            <table className="table table-sm align-middle">
              <thead className="table-dark">
                <tr>
                  <th>شرح</th>
                  <th>تعداد</th>
                  <th>قیمت واحد ({pf.currency})</th>
                  <th>مبلغ</th>
                </tr>
              </thead>
              <tbody>
                {pf.items?.map(it => (
                  <tr key={it.id}>
                    <td>
                      <div>{it.title}</div>
                      {it.description && <div className="small text-muted">{it.description}</div>}
                    </td>
                    <td>{fmt(it.qty)}</td>
                    <td>{fmt(it.unit_price)}</td>
                    <td>{fmt(it.line_total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr><td colSpan={3} className="text-muted">جمع جزء</td><td>{fmt(pf.subtotal)}</td></tr>
                <tr><td colSpan={3} className="text-muted">تخفیف</td><td>{fmt(pf.discount)}</td></tr>
                <tr><td colSpan={3} className="text-muted">مالیات</td><td>{fmt(pf.tax)}</td></tr>
                <tr><td colSpan={3} className="fw-bold">قابل پرداخت</td><td className="fw-bold text-warning">{fmt(pf.total)} {pf.currency}</td></tr>
              </tfoot>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
