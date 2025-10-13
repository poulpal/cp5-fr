import * as FileSaver from "file-saver";
import { Button, Col, Label, Row } from "reactstrap";
import XLSX from "sheetjs-style-v2";
import { useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { _arrayBufferToBase64, isNative } from "../../../utility/Utils";
import apiConfig from "../../../configs/apiConfig";
import Swal from "sweetalert2";

// وضعیت رنت از تنظیمات
const buildingOptions = JSON.parse(localStorage.getItem("buildingOptions") || "{}");
const hasRent = buildingOptions.has_rent || false;

// در UI همه‌چیز ریال است
const currency = "rial";

// فقط ارقام
const digitsOnly = (v) => (v || "").toString().replace(/\D+/g, "");

const AddMultipleUnit = ({ setLoading, refreshData, toggleModal }) => {
  const [excelData, setExcelData] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  /**
   * دانلود فایل نمونه Excel با تمام فیلدهای جدید
   */
  const handleDownloadSample = () => {
    const sampleData = [
      {
        "شماره واحد": "101",
        "طبقه": "3",
        "بلوک": "1",
        "مساحت": "85",
        "تعداد نفرات": "4",
        "تلفن ثابت": "02112345678",
        "تعداد پارکینگ": "1",
        "شماره‌های پارکینگ": "P12",
        "تعداد انباری": "1",
        "شماره‌های انباری": "S5",
        "نام": "علی",
        "نام خانوادگی": "رضایی",
        "تلفن همراه": "09121234567",
        "وضعیت": "مالک",
        "شارژ ماهیانه (ریال)": "5000000",
        ...(hasRent ? { "اجاره ماهیانه (ریال)": "0" } : {}),
      },
      {
        "شماره واحد": "102",
        "طبقه": "3",
        "بلوک": "1",
        "مساحت": "90",
        "تعداد نفرات": "3",
        "تلفن ثابت": "",
        "تعداد پارکینگ": "2",
        "شماره‌های پارکینگ": "P13، P14",
        "تعداد انباری": "1",
        "شماره‌های انباری": "S6",
        "نام": "زهرا",
        "نام خانوادگی": "احمدی",
        "تلفن همراه": "09122223333",
        "وضعیت": "مستأجر",
        "شارژ ماهیانه (ریال)": "4500000",
        ...(hasRent ? { "اجاره ماهیانه (ریال)": "15000000" } : {}),
      },
    ];

    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });

    // پشتیبانی React Native
    if (isNative() && window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          action: "downloadExcel",
          type: "xlsx",
          name: "units_sample" + fileExtension,
          data: _arrayBufferToBase64(excelBuffer),
          url: apiConfig.baseUrl + "/building_manager/excelDownload",
          token: localStorage.getItem("accessToken"),
        })
      );
      return;
    }

    FileSaver.saveAs(data, "units_sample" + fileExtension);
    toast.success("فایل نمونه دانلود شد");
  };

  /**
   * اعتبارسنجی داده‌های Excel
   */
  const validateExcelData = (data) => {
    const errors = [];
    const mobileRegex = /^09\d{9}$/;
    const landlineRegex = /^0\d{9,10}$/;

    data.forEach((item, index) => {
      const row = index + 2; // ردیف اول header است

      // فیلدهای الزامی
      if (!item["شماره واحد"]) {
        errors.push(`ردیف ${row}: شماره واحد الزامی است`);
      }

      if (!item["تلفن همراه"]) {
        errors.push(`ردیف ${row}: تلفن همراه الزامی است`);
      } else if (!mobileRegex.test(digitsOnly(item["تلفن همراه"]))) {
        errors.push(
          `ردیف ${row}: تلفن همراه نامعتبر است (${item["تلفن همراه"]}). باید 11 رقم شروع با 09 باشد`
        );
      }

      if (!item["شارژ ماهیانه (ریال)"]) {
        errors.push(`ردیف ${row}: شارژ ماهیانه الزامی است`);
      } else {
        const charge = parseFloat(
          String(item["شارژ ماهیانه (ریال)"]).replace(/,/g, "")
        );
        if (isNaN(charge) || charge <= 0) {
          errors.push(
            `ردیف ${row}: شارژ ماهیانه باید عدد مثبت باشد (${item["شارژ ماهیانه (ریال)"]})`
          );
        }
      }

      if (!item["وضعیت"]) {
        errors.push(`ردیف ${row}: وضعیت الزامی است`);
      } else if (!["مالک", "مستأجر", "مستاجر"].includes(item["وضعیت"])) {
        errors.push(
          `ردیف ${row}: وضعیت باید "مالک" یا "مستأجر" باشد (${item["وضعیت"]})`
        );
      }

      // فیلدهای اختیاری اما باید معتبر باشند
      if (
        item["تلفن ثابت"] &&
        item["تلفن ثابت"].trim() !== "" &&
        !landlineRegex.test(digitsOnly(item["تلفن ثابت"]))
      ) {
        errors.push(
          `ردیف ${row}: تلفن ثابت نامعتبر است (${item["تلفن ثابت"]}). باید 10 یا 11 رقم شروع با 0 باشد`
        );
      }

      if (item["طبقه"] && !/^\d*$/.test(String(item["طبقه"]))) {
        errors.push(`ردیف ${row}: طبقه باید عدد باشد (${item["طبقه"]})`);
      }

      if (item["مساحت"]) {
        const area = parseFloat(String(item["مساحت"]).replace(/,/g, ""));
        if (isNaN(area) || area < 0) {
          errors.push(`ردیف ${row}: مساحت نامعتبر است (${item["مساحت"]})`);
        }
      }
    });

    return errors;
  };

  /**
   * آپلود و Parse Excel
   */
  const handleUploadExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // بررسی حجم فایل (حداکثر 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم فایل بیش از 5 مگابایت است");
      return;
    }

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          toast.error("فایل Excel خالی است");
          return;
        }

        if (data.length > 100) {
          toast.error("حداکثر 100 واحد در هر بار مجاز است");
          return;
        }

        console.log("📊 Excel Data:", data);

        // اعتبارسنجی
        const errors = validateExcelData(data);
        if (errors.length > 0) {
          Swal.fire({
            title: "❌ خطاهای یافت شده در فایل Excel",
            html: `<div style="text-align: right; max-height: 400px; overflow-y: auto;">
              ${errors.map((err) => `<p style="margin: 5px 0;">• ${err}</p>`).join("")}
            </div>`,
            icon: "error",
            confirmButtonText: "متوجه شدم",
            width: "600px",
          });
          return;
        }

        setExcelData(data);
        toast.success(`${data.length} واحد آماده ثبت است`);
      } catch (error) {
        console.error("Parse Error:", error);
        toast.error("خطا در خواندن فایل Excel. لطفاً فرمت فایل را بررسی کنید");
      }
    };

    reader.onerror = () => {
      toast.error("خطا در بارگذاری فایل");
    };

    reader.readAsBinaryString(file);
  };

  /**
   * ارسال داده‌ها به سرور
   */
  const handleSubmit = async () => {
    if (excelData.length === 0) {
      toast.error("لطفاً ابتدا فایل Excel را بارگذاری کنید");
      return;
    }

    // تأییدیه قبل از ارسال
    const result = await Swal.fire({
      title: "آیا مطمئن هستید؟",
      html: `<p>${excelData.length} واحد به ساختمان اضافه می‌شود</p>
        <p style="font-size: 12px; color: #666;">این عملیات ممکن است چند لحظه طول بکشد</p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "بله، ثبت شود",
      cancelButtonText: "انصراف",
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#dc3545",
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    setUploadProgress(10);

    try {
      // نقشه‌برداری فیلدهای Excel به فرمت Backend
      let units = excelData.map((item) => {
        const charge = String(item["شارژ ماهیانه (ریال)"] || "0").replace(/,/g, "");
        const rent = hasRent
          ? String(item["اجاره ماهیانه (ریال)"] || "0").replace(/,/g, "")
          : undefined;
        const area = String(item["مساحت"] || "0").replace(/,/g, "");

        return {
          unit_number: item["شماره واحد"],
          
          // فیلدهای جدید
          floor: item["طبقه"] ? Number(digitsOnly(String(item["طبقه"]))) : undefined,
          block: item["بلوک"] ? Number(digitsOnly(String(item["بلوک"]))) : 1,
          area: area ? parseFloat(area) : 0,
          resident_count: item["تعداد نفرات"] ? Number(digitsOnly(String(item["تعداد نفرات"]))) : 0,
          landline_phone: (item["تلفن ثابت"] || "").toString().trim(),
          parking_count: item["تعداد پارکینگ"] ? Number(digitsOnly(String(item["تعداد پارکینگ"]))) : 1,
          parking_numbers: (item["شماره‌های پارکینگ"] || "").toString().trim(),
          storage_count: item["تعداد انباری"] ? Number(digitsOnly(String(item["تعداد انباری"]))) : 1,
          storage_numbers: (item["شماره‌های انباری"] || "").toString().trim(),
          
          // هویت ساکن
          first_name: (item["نام"] || "").toString().trim(),
          last_name: (item["نام خانوادگی"] || "").toString().trim(),
          mobile: digitsOnly(item["تلفن همراه"]),
          
          // مالی
          charge_fee: parseFloat(charge) / (currency === "rial" ? 10 : 1), // تبدیل ریال→تومان
          rent_fee: rent ? parseFloat(rent) / (currency === "rial" ? 10 : 1) : undefined,
          ownership: item["وضعیت"] === "مالک" ? "owner" : "renter",
        };
      });

      setUploadProgress(30);

      // ارسال به Backend
      const response = await axios.post("/building_manager/units/addMultipleUnits", {
        units,
      });

      setUploadProgress(100);

      await Swal.fire({
        title: "✅ موفقیت",
        text: response.data?.message || "همه واحدها با موفقیت اضافه شدند",
        icon: "success",
        confirmButtonText: "عالی!",
      });

      refreshData?.();
      toggleModal?.();
      setExcelData([]);
      setUploadProgress(0);
    } catch (err) {
      console.error("Submit Error:", err);

      let errorMessage = "خطا در افزودن واحدها";
      
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorList = Object.keys(errors)
          .map((key) => `• ${errors[key][0]}`)
          .join("<br>");
        
        Swal.fire({
          title: "❌ خطاهای اعتبارسنجی",
          html: `<div style="text-align: right;">${errorList}</div>`,
          icon: "error",
          confirmButtonText: "متوجه شدم",
        });
        return;
      } else if (err.request) {
        errorMessage = "اتصال به سرور برقرار نشد. لطفاً اتصال اینترنت خود را بررسی کنید";
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  /**
   * نرمال‌سازی مقادیر برای نمایش
   */
  const formatValue = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    return value.toString();
  };

  return (
    <>
      {/* دکمه‌های دانلود و آپلود */}
      <Row className="mb-3">
        <Col md="6" className="d-flex justify-content-center align-items-center">
          <Button color="primary" onClick={handleDownloadSample}>
            📥 دانلود فایل نمونه Excel
          </Button>
        </Col>
        <Col md="6">
          <Label for="excel_file">بارگزاری فایل Excel</Label>
          <input
            name="excel_file"
            type="file"
            accept=".xlsx,.xls"
            className="form-control form-control-lg"
            onChange={handleUploadExcel}
          />
          <small className="text-muted">
            فرمت: .xlsx | حداکثر حجم: 5MB | حداکثر تعداد: 100 واحد
          </small>
        </Col>
      </Row>

      {/* Progress Bar */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mb-3">
          <div className="progress" style={{ height: "25px" }}>
            <div
              className="progress-bar progress-bar-striped progress-bar-animated"
              role="progressbar"
              style={{ width: `${uploadProgress}%` }}
            >
              {uploadProgress}%
            </div>
          </div>
        </div>
      )}

      {/* نمایش داده‌های Excel */}
      {excelData.length > 0 && (
        <>
          <div className="alert alert-info">
            <strong>✅ {excelData.length} واحد آماده ثبت است</strong>
            <br />
            <small>لطفاً اطلاعات زیر را بررسی کنید و سپس دکمه ثبت را بزنید</small>
          </div>

          <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #ddd", borderRadius: "8px", padding: "10px" }}>
            {excelData.map((item, index) => (
              <div key={index} className="mb-3 p-3" style={{ backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                <h6 className="mb-2" style={{ color: "#495057", fontWeight: "bold" }}>
                  🏠 واحد {formatValue(item["شماره واحد"])} - {formatValue(item["نام"])} {formatValue(item["نام خانوادگی"])}
                </h6>
                <Row>
                  <Col md="3" sm="6">
                    <small className="text-muted">شماره واحد:</small>
                    <div><strong>{formatValue(item["شماره واحد"])}</strong></div>
                  </Col>
                  <Col md="3" sm="6">
                    <small className="text-muted">طبقه:</small>
                    <div>{formatValue(item["طبقه"])}</div>
                  </Col>
                  <Col md="3" sm="6">
                    <small className="text-muted">بلوک:</small>
                    <div>{formatValue(item["بلوک"])}</div>
                  </Col>
                  <Col md="3" sm="6">
                    <small className="text-muted">مساحت:</small>
                    <div>{formatValue(item["مساحت"])} متر</div>
                  </Col>
                  <Col md="3" sm="6">
                    <small className="text-muted">تلفن همراه:</small>
                    <div>{formatValue(item["تلفن همراه"])}</div>
                  </Col>
                  <Col md="3" sm="6">
                    <small className="text-muted">تلفن ثابت:</small>
                    <div>{formatValue(item["تلفن ثابت"])}</div>
                  </Col>
                  <Col md="3" sm="6">
                    <small className="text-muted">پارکینگ:</small>
                    <div>{formatValue(item["شماره‌های پارکینگ"])}</div>
                  </Col>
                  <Col md="3" sm="6">
                    <small className="text-muted">انباری:</small>
                    <div>{formatValue(item["شماره‌های انباری"])}</div>
                  </Col>
                  <Col md="4" sm="6">
                    <small className="text-muted">شارژ ماهیانه:</small>
                    <div>
                      <strong style={{ color: "#28a745" }}>
                        {String(item["شارژ ماهیانه (ریال)"] || "0")
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ریال
                      </strong>
                    </div>
                  </Col>
                  {hasRent && (
                    <Col md="4" sm="6">
                      <small className="text-muted">اجاره ماهیانه:</small>
                      <div>
                        {String(item["اجاره ماهیانه (ریال)"] || "0")
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ریال
                      </div>
                    </Col>
                  )}
                  <Col md="4" sm="6">
                    <small className="text-muted">وضعیت:</small>
                    <div>
                      <span
                        className={`badge ${
                          item["وضعیت"] === "مالک" ? "bg-success" : "bg-info"
                        }`}
                      >
                        {formatValue(item["وضعیت"])}
                      </span>
                    </div>
                  </Col>
                </Row>
              </div>
            ))}
          </div>

          {/* دکمه ثبت */}
          <div className="mt-3 d-flex justify-content-center w-100">
            <Button
              color="success"
              size="lg"
              onClick={handleSubmit}
              disabled={uploadProgress > 0 && uploadProgress < 100}
              style={{ minWidth: "200px", fontWeight: "bold" }}
            >
              {uploadProgress > 0 && uploadProgress < 100 ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  در حال ثبت...
                </>
              ) : (
                <>✅ ثبت {excelData.length} واحد</>
              )}
            </Button>
          </div>
        </>
      )}

      {/* راهنمای استفاده */}
      {excelData.length === 0 && (
        <div className="alert alert-primary mt-3" style={{ textAlign: "right" }}>
          <h6>📋 راهنمای استفاده:</h6>
          <ol style={{ paddingRight: "20px", marginBottom: 0 }}>
            <li>ابتدا فایل نمونه Excel را دانلود کنید</li>
            <li>اطلاعات واحدها را در فایل Excel وارد کنید</li>
            <li>فایل را ذخیره کرده و در این صفحه بارگذاری کنید</li>
            <li>پس از بررسی، دکمه ثبت را بزنید</li>
          </ol>
          <hr />
          <small>
            <strong>⚠️ نکات مهم:</strong>
            <ul style={{ paddingRight: "20px", marginTop: "10px", marginBottom: 0 }}>
              <li>شماره واحد، تلفن همراه، شارژ ماهیانه و وضعیت الزامی هستند</li>
              <li>تلفن همراه باید 11 رقم و شروع با 09 باشد</li>
              <li>وضعیت باید "مالک" یا "مستأجر" باشد</li>
              <li>شارژ و اجاره به ریال وارد شوند</li>
              <li>حداکثر 100 واحد در هر بار مجاز است</li>
            </ul>
          </small>
        </div>
      )}
    </>
  );
};

export default AddMultipleUnit;