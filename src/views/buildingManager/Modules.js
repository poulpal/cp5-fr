import toast from "react-hot-toast";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import LoadingComponent from "../../components/LoadingComponent";
import { Button, Card, Col, FormGroup, Input, Label, Row } from "reactstrap";
import moment from "moment-jalaali";

/**
 * قیمت‌گذاری انگیزشی:
 * - ماهانه: پرداخت = 1 ماه
 * - 3ماهه: پرداخت = 2.5 ماه
 * - سالانه: پرداخت = 10 ماه
 * UI: فقط «صرفه‌جویی X٪»؛ بدون ذکر نیم‌ماه/۲ ماه/روز.
 */
const PERIODS = [
  { key: "monthly",   label: "ماهانه", months: 1,   payMonths: 1.0 },
  { key: "quarterly", label: "۳ماهه",  months: 3,   payMonths: 2.5 },
  { key: "yearly",    label: "سالانه", months: 12,  payMonths: 10.0 },
];

// درصد صرفه‌جویی نسبتی از کل دوره
const savingPercent = (periodKey) => {
  const p = PERIODS.find(x => x.key === periodKey) || PERIODS[2];
  const saveMonths = p.months - p.payMonths; // 0.5 یا 2
  return Math.round((saveMonths / p.months) * 100); // ≈ 17٪
};

// مبلغ دوره از پایه ماهانه (ریال)
const priceForPeriodRial = (monthlyBaseRial, periodKey) => {
  const p = PERIODS.find(x => x.key === periodKey) || PERIODS[2];
  if (!monthlyBaseRial || monthlyBaseRial <= 0) return 0;
  return Math.round(monthlyBaseRial * p.payMonths);
};

// نمایش به «تومان» با جداکننده نقطه (مثال: 3.900.000)
const toToman = (rial) => Math.round((rial || 0) / 10);
const formatToman = (rial) => String(toToman(rial)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export default function ModulesPage() {
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState([]);             // [{type, modules:[{slug,title,price,offer_before_price,type,...}]}]
  const [activeModules, setActiveModules] = useState([]);  // [{slug, ends_at}]
  const [selectedModules, setSelectedModules] = useState([]);

  // تخفیف
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountValue, setDiscountValue] = useState(null);   // number
  const [discountType, setDiscountType] = useState(null);     // "fixed" | "percent"
  const [initialDiscount, setInitialDiscount] = useState(false);

  // دورهٔ صورتحساب
  const [billingPeriod, setBillingPeriod] = useState("yearly"); // monthly | quarterly | yearly

  const ua = navigator.userAgent;
  const isInApp = ua.indexOf("ChargePalApp") >= 0;

  const resetManualDiscount = () => {
    setHasDiscount(false);
    setDiscountCode("");
    setDiscountValue(null);
    setDiscountType(null);
    setInitialDiscount(false);
  };

  const getModules = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/building_manager/modules");
      const payload = data?.data || {};
      setModules(payload.modules || []);
      setActiveModules(payload.activeModules || []);

      const autoCode = payload.discount_code || null;
      if (autoCode) {
        try {
          const res = await axios.post("/building_manager/modules/checkDiscountCode", { discount_code: autoCode });
          if (res.data?.success) {
            setHasDiscount(true);
            setDiscountCode(autoCode);
            setDiscountValue(res.data.data.value);
            setDiscountType(res.data.data.type);
            setInitialDiscount(true);
          }
        } catch { /* ignore */ }
      } else {
        resetManualDiscount();
      }
    } catch (e) {
      toast.error("خطا در دریافت اطلاعات");
      console.log(e);
    }
    setLoading(false);
  };

  useEffect(() => { getModules(); }, []);

  // محاسبهٔ آیتم‌های انتخاب‌شده با قیمت دوره‌ای
  const computedSelected = useMemo(() => {
    return selectedModules.map(m => {
      const baseMonthlyRial = initialDiscount && m.offer_before_price ? m.offer_before_price : (m.price || 0);
      return { ...m, _periodPriceRial: priceForPeriodRial(baseMonthlyRial, billingPeriod) };
    });
  }, [selectedModules, billingPeriod, initialDiscount]);

  const subtotalRial = useMemo(
    () => computedSelected.reduce((s, m) => s + (m._periodPriceRial || 0), 0),
    [computedSelected]
  );

  const discountAmountRial = useMemo(() => {
    if (!discountValue) return 0;
    if (discountType === "fixed") return discountValue; // فرض: fixed به ریال است
    if (discountType === "percent") return Math.round(subtotalRial * (discountValue / 100));
    return 0;
  }, [discountValue, discountType, subtotalRial]);

  const taxableBaseRial = Math.max(subtotalRial - discountAmountRial, 0);
  const vatRial = Math.round(taxableBaseRial * 0.1); // 10%
  const grandTotalRial = taxableBaseRial + vatRial;

  const handleCheckDiscount = async () => {
    if (!discountCode?.trim()) return toast.error("کد تخفیف را وارد کنید.");
    setLoading(true);
    try {
      const res = await axios.post("/building_manager/modules/checkDiscountCode", { discount_code: discountCode });
      if (res.data?.success) {
        setHasDiscount(true);
        setDiscountValue(res.data.data.value);
        setDiscountType(res.data.data.type);
        toast.success("کد تخفیف اعمال شد.");
      } else {
        toast.error(res.data?.message || "کد نامعتبر است.");
      }
    } catch (e) {
      toast.error("خطا در بررسی کد تخفیف");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDiscount = () => {
    resetManualDiscount();
    toast("کد تخفیف حذف شد.");
  };

  // انتخاب/لغو انتخاب با کلیک روی ردیف
  const toggleSelect = (module) => {
    if (module.slug?.startsWith?.("extra")) return; // غیرفعال
    setSelectedModules(prev => {
      const exists = prev.some(x => x.slug === module.slug);
      if (exists) return prev.filter(x => x.slug !== module.slug);
      // فقط یک base
      if (prev.some(x => x.type === "base") && module.type === "base") {
        return [...prev.filter(x => x.type !== "base"), module];
      }
      return [...prev, module];
    });
  };

  const handleBuyModules = async () => {
    if (computedSelected.length === 0) return toast.error("هیچ ماژولی انتخاب نشده است.");
    setLoading(true);
    try {
      const res = await axios.post("/building_manager/modules/buy", {
        modules: computedSelected.map(e => e.slug),
        discount_code: hasDiscount ? discountCode : null,
        period: billingPeriod,
      });
      if (res.data?.success) {
        if (res.data?.message) {
          toast.success(res.data.message);
          return location.reload();
        }
        if (ua.indexOf("ChargePalApp") >= 0) window.open(res.data.data.redirectUrl, "_blank");
        else window.location.replace(res.data.data.redirectUrl);
      }
    } catch (err) {
      if (err?.response?.data?.errors) {
        Object.values(err.response.data.errors).forEach(msg => toast.error(msg));
      } else {
        toast.error("خطا در خرید");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProforma = async () => {
    if (computedSelected.length === 0) return toast.error("هیچ ماژولی انتخاب نشده است.");
    setLoading(true);
    try {
      const items = computedSelected.map(m => ({
        title: m.title,
        description: m.description ?? null,
        qty: 1,
        unit_price: m._periodPriceRial || 0, // ریال
      }));
      const { data } = await axios.post("/proforma", {
        items,
        tax_percent: 10,
        period: billingPeriod,
        meta: {
          from: "building_manager/modules",
          discount_applied_client: hasDiscount ? { type: discountType, value: discountValue } : null,
        },
      });
      const pf = data?.data;
      if (pf?.id) {
        toast.success("پیش‌فاکتور صادر شد.");
        window.location.replace(`/proforma/${pf.id}/preview`);
      } else {
        toast.error("پاسخ نامعتبر از سرور.");
      }
    } catch (e) {
      toast.error("خطا در ایجاد پیش‌فاکتور.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingComponent loading={loading} />

      <Card style={{ minHeight: "89vh", padding: "1rem" }}>
        <div className="pb-4 pt-2">
          <h3 className="text-center mb-2">پکیج‌های {import.meta.env.VITE_APP_NAME}</h3>

          {/* انتخاب دوره؛ بدون توضیحات انگیزشی زیر دکمه‌ها */}
          <Row className="mb-3">
            <Col md="12" className="d-flex gap-2 justify-content-center align-items-center flex-wrap">
              {PERIODS.map(p => (
                <Button
                  key={p.key}
                  color={billingPeriod === p.key ? "primary" : "secondary"}
                  outline={billingPeriod !== p.key}
                  onClick={() => setBillingPeriod(p.key)}
                >
                  {p.label}
                </Button>
              ))}
            </Col>
          </Row>

          <Row>
            <Col md={9}>
              {modules.map((group, gi) => (
                <div className="mb-3" key={`grp-${gi}`}>
                  <h5 className="mb-2">{group.type}</h5>

                  <table className="table table-striped table-bordered table-hover table-sm">
                    <thead>
                      <tr>
                        <th style={{ width: "25%" }}>نام</th>
                        <th className="d-none d-md-table-cell" style={{ width: "40%" }}>توضیحات</th>
                        <th style={{ width: "35%" }}>
                          قیمت ({PERIODS.find(p => p.key === billingPeriod)?.label})
                          {/* فقط صرفه‌جویی در سلول قیمت نمایش داده می‌شود */}
                        </th>
                        {/* ستون انتخاب نداریم؛ انتخاب با ردیف */}
                      </tr>
                    </thead>
                    <tbody>
                      {(group.modules || []).map((m, mi) => {
                        const isActive = activeModules.some(e => e.slug === m.slug);
                        const selected = selectedModules.some(e => e.slug === m.slug);
                        const ends = activeModules.find(e => e.slug === m.slug)?.ends_at;

                        const baseMonthlyRial = initialDiscount && m.offer_before_price ? m.offer_before_price : (m.price || 0);
                        const pPriceRial = priceForPeriodRial(baseMonthlyRial, billingPeriod);
                        const sp = billingPeriod !== "monthly" ? savingPercent(billingPeriod) : null;

                        // رنگ: انتخاب = آبی، فعال (قبلی) = سبز. اگر هر دو، آبی می‌ماند ولی نوار سبز هم اضافه می‌شود.
                        const rowClass = selected ? "table-primary" : (isActive ? "table-success" : "");
                        const rowStyle = isActive ? { borderRight: "4px solid #28a745" } : undefined;

                        return (
                          <tr
                            key={`m-${gi}-${mi}`}
                            className={rowClass}
                            style={{ cursor: m.slug?.startsWith?.("extra") ? "not-allowed" : "pointer", ...rowStyle }}
                            onClick={() => toggleSelect(m)}
                            title={isActive ? "این پکیج در حال حاضر برای شما فعال است" : undefined}
                          >
                            <td>
                              {m.title}
                              {isActive && (
                                <small className="ms-2 text-success d-none d-md-inline">(فعال)</small>
                              )}
                            </td>
                            <td className="d-none d-md-table-cell">{m.description}</td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{formatToman(pPriceRial)}</div>
                              {sp ? <small className="text-success">صرفه‌جویی {sp}%</small> : null}
                              {ends && (
                                <div className="d-none d-md-block">
                                  <small className="text-muted">اتمام: {moment(ends).format("jYYYY/jMM/jDD")}</small>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </Col>

            <Col md={3}>
              {!isInApp ? (
                <div className="mb-3">
                  <h5 className="mb-2">صورتحساب</h5>

                  {/* کد تخفیف */}
                  <FormGroup switch className="py-1">
                    <Input
                      type="switch"
                      role="switch"
                      id="discount"
                      checked={hasDiscount}
                      onChange={(e) => {
                        const on = e.target.checked;
                        setHasDiscount(on);
                        if (!on) {
                          setDiscountCode("");
                          setDiscountValue(null);
                          setDiscountType(null);
                          setInitialDiscount(false);
                        }
                      }}
                    />
                    <Label check>کد تخفیف / معرف</Label>
                  </FormGroup>

                  {hasDiscount && (
                    <Row className="pt-1 pb-2 px-1">
                      <Col md="8" className="p-0">
                        <Input
                          type="text"
                          size="sm"
                          id="discountCode"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value)}
                          placeholder="کد تخفیف"
                        />
                      </Col>
                      <Col md="4" className="p-0 d-flex gap-1">
                        <Button block color="primary" onClick={handleCheckDiscount} disabled={!discountCode || !!discountValue}>
                          اعمال
                        </Button>
                        {discountValue && (
                          <Button block color="secondary" outline onClick={handleRemoveDiscount}>
                            حذف
                          </Button>
                        )}
                      </Col>
                    </Row>
                  )}

                  {/* خلاصه قیمت‌ها به تومان با نقطه */}
                  <table className="table table-striped table-bordered table-hover table-sm">
                    <tbody>
                      {computedSelected.map((m, i) => (
                        <tr key={`sel-${i}`}>
                          <td>{m.title}</td>
                          <td style={{ textAlign: "left", fontWeight: 600 }}>
                            {formatToman(m._periodPriceRial)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-light">
                        <td>جمع کل</td>
                        <td style={{ textAlign: "left" }}>
                          {formatToman(subtotalRial)}
                        </td>
                      </tr>
                      {discountValue ? (
                        <tr>
                          <td>تخفیف {discountType === "percent" ? `(${discountValue}%)` : "(ثابت)"}</td>
                          <td style={{ textAlign: "left" }}>
                            {formatToman(discountAmountRial)}
                          </td>
                        </tr>
                      ) : null}
                      <tr>
                        <td>مالیات (۱۰٪)</td>
                        <td style={{ textAlign: "left" }}>
                          {formatToman(vatRial)}
                        </td>
                      </tr>
                      <tr className="bg-light">
                        <td>مبلغ قابل پرداخت</td>
                        <td style={{ textAlign: "left", fontWeight: 700 }}>
                          {formatToman(grandTotalRial)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2} className="pt-2">
                          <div className="mb-2 text-muted" style={{ fontSize: 12 }}>
                            دورهٔ انتخابی: <strong>{PERIODS.find(p => p.key === billingPeriod)?.label}</strong>
                          </div>
                          <Button
                            color="primary"
                            disabled={computedSelected.length === 0}
                            block
                            onClick={handleBuyModules}
                            className="mb-1"
                          >
                            پرداخت
                          </Button>
                          <Button
                            color="secondary"
                            outline
                            disabled={computedSelected.length === 0}
                            block
                            onClick={handleProforma}
                          >
                            تولید پیش‌فاکتور
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mb-3">
                  قابلیت خرید پکیج‌ها در اپ فعال نیست. برای خرید به وب‌سایت مراجعه کنید.
                </div>
              )}
            </Col>
          </Row>

          <div className="text-center mt-2">
            <small className="text-muted">
              ترتیب محاسبه: ابتدا قیمت دوره (۲٫۵×/۱۰×)، سپس تخفیف کد، سپس مالیات ۱۰٪. نمایش ارقام: تومان.
            </small>
          </div>
        </div>
      </Card>
    </>
  );
}
