import { useMemo, useState } from "react";
import { Button, Card, CardBody, CardHeader, Col, Row, Badge, FormGroup, Input, Label } from "reactstrap";
import axios from "axios";
import toast from "react-hot-toast";
import moment from "moment-jalaali";

const formatToman = (rial) => {
  if (rial == null) return "-";
  const t = Math.round(Number(rial) / 10);
  return t.toLocaleString("fa-IR") + " تومان";
};

export default function RentAddonCard({ onActivated }) {
  const [loading, setLoading] = useState(false);
  const buildingOptions = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("buildingOptions") || "{}"); }
    catch { return {}; }
  }, []);

  const isActive = !!buildingOptions?.has_rent;
  const endsAt = buildingOptions?.rent_ends_at ? moment(buildingOptions.rent_ends_at) : null;

  const [discountCode, setDiscountCode] = useState("");
  const [hasDiscount, setHasDiscount] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      // ✅ خرید از مسیر پکیج‌ها/ماژول‌ها
      const payload = {
        modules: ["rent"],                        // ماژول اجاره
        ...(hasDiscount && discountCode ? { discount_code: discountCode } : {})
      };
      const res = await axios.post("/building_manager/modules/buy", payload);

      if (res?.data?.success) {
        toast.success(res?.data?.message || "افزونه اجاره فعال شد");

        // به‌روزرسانی فوری UI
        try {
          const opts = JSON.parse(localStorage.getItem("buildingOptions") || "{}");
          opts.has_rent = true;
          localStorage.setItem("buildingOptions", JSON.stringify(opts));
        } catch {}

        if (typeof onActivated === "function") onActivated();

        // اگر درگاه نیاز به هدایت دارد
        const redirect = res?.data?.data?.redirectUrl || res?.data?.redirectUrl;
        if (redirect) {
          if (navigator.userAgent.indexOf("ChargePalApp") >= 0) window.open(redirect, "_blank");
          else window.location.replace(redirect);
        }
      } else {
        toast.error(res?.data?.message || "خطا در فعال‌سازی افزونه");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "خطا در خرید افزونه اجاره";
      toast.error(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-2">
      <CardHeader className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <h5 className="mb-0">افزونه: مدیریت اجاره</h5>
          {isActive ? <Badge color="success" className="ms-2">فعال</Badge> : <Badge color="secondary" className="ms-2">غیرفعال</Badge>}
        </div>
        {endsAt && <small className="text-muted">اتمام: {endsAt.format("jYYYY/jMM/jDD")}</small>}
      </CardHeader>
      <CardBody>
        <Row className="align-items-center">
          <Col md="8" className="mb-2">
            <div className="text-muted">
              ردیابی قراردادهای اجاره، دریافت اجاره ماهانه، ثبت افزایش سالانه و گزارش‌های ویژهٔ مستأجران.
            </div>
          </Col>
          <Col md="4" className="text-center">
            {isActive ? (
              <Button color="success" disabled block>فعال است</Button>
            ) : (
              <div>
                <FormGroup switch className="mb-1">
                  <Input type="switch" role="switch" id="rent-discount" onChange={(e)=> setHasDiscount(e.target.checked)} />
                  <Label check>کد تخفیف دارم</Label>
                </FormGroup>
                {hasDiscount && (
                  <Input className="mb-1" value={discountCode} onChange={e=>setDiscountCode(e.target.value)} placeholder="کد تخفیف" />
                )}
                <Button color="primary" block disabled={loading} onClick={handlePurchase}>
                  خرید و فعال‌سازی
                </Button>
              </div>
            )}
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
}
