import * as FileSaver from "file-saver";
import { Button, Col, Label, Row, UncontrolledTooltip } from "reactstrap";
import XLSX from "sheetjs-style-v2";
import { useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { _arrayBufferToBase64, isNative } from "../../../utility/Utils";
import apiConfig from "../../../configs/apiConfig";

const AddMultipleUnit = ({ setLoading, refreshData, toggleModal }) => {
  const [excelData, setExcelData] = useState([]);

  const currency = localStorage.getItem("currency");

  const handleSubmit = async () => {
    setLoading(true);
    let units = excelData.map((item) => {
      return {
        unit_number: item["شماره واحد"],
        area: item["مساحت"] ? item["مساحت"] : 0,
        resident_count: item["تعداد نفرات"] ? item["تعداد نفرات"] : 0,
        first_name: item["نام"],
        last_name: item["نام خانوادگی"],
        mobile: item["تلفن همراه"],
        charge_fee: typeof item["شارژ ماهیانه"] == "string" ? item["شارژ ماهیانه"].replace(/,/g, "") : item["شارژ ماهیانه"],
        ownership: item["وضعیت"] == "مالک" ? "owner" : "renter",
      };
    });
    if (currency === "rial") {
      units = units.map((unit) => {
        return {
          ...unit,
          charge_fee: unit.charge_fee / 10,
        };
      });
    }
    try {
      const response = await axios.post(
        "/building_manager/units/addMultipleUnits",
        {
          units,
        }
      );
      toast.success(response.data.message);
      refreshData();
      toggleModal();
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      }
      if (err.response && err.response.data.errors) {
        Object.keys(err.response.data.errors).forEach((key) => {
          toast.error(err.response.data.errors[key][0]);
        });
      }
    }
    setLoading(false);
  };

  const handleDownloadSample = () => {
    const excelData = [
      {
        "شماره واحد": "1",
        "مساحت": "0",
        "تعداد نفرات": "0",
        نام: "",
        "نام خانوادگی": "",
        "تلفن همراه": "09123456789",
        "شارژ ماهیانه": "100000",
        "وضعیت": "مالک/مستاجر",
      },
    ];
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    if (isNative() && window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        action: "downloadExcel",
        type: "xlsx",
        name: "units_sample" + fileExtension,
        data: _arrayBufferToBase64(excelBuffer),
        url: apiConfig.baseUrl + "/building_manager/excelDownload",
        token: localStorage.getItem("accessToken")
      }));
      return;
    }
    FileSaver.saveAs(data, "units_sample" + fileExtension);
  };

  const handleUploadExcel = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      console.log(data);
      let is_valid = true;
      // data.forEach((item) => {
      //   if (
      //     !(
      //       item["شماره واحد"] &&
      //       // (item["نام"] == "" || item["نام"]) &&
      //       // (item["نام خانوادگی"] == "" || item["نام خانوادگی"]) &&
      //       item["تلفن همراه"] &&
      //       item["شارژ ماهیانه"]
      //     )
      //   ) {
      //     toast.error("فایل اکسل شما معتبر نیست");
      //     is_valid = false;
      //   }
      // });
      if (!is_valid) return;
      setExcelData(data);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <>
      <Row className="mb-2">
        <Col
          md="6"
          className="m-auto d-flex justify-content-center align-items-center"
        >
          <Button
            id="export"
            color="primary"
            onClick={() => {
              handleDownloadSample();
            }}
          >
            دانلود فایل نمونه اکسل
          </Button>
        </Col>
        <Col md="6">
          <Label for="excel_file">بارگزاری فایل اکسل</Label>
          <input
            name="excel_file"
            type="file"
            className="form-control form-control-lg"
            onChange={handleUploadExcel}
          />
        </Col>
      </Row>
      {excelData.map((item, index) => (
        <>
          <hr className="mt-1" />
          <Row>
            <Col md="4">
              <Label for="unit_number">شماره واحد</Label>
              <input
                name="unit_number"
                type="text"
                className="form-control"
                disabled={true}
                value={item["شماره واحد"]}
              />
            </Col>
            <Col md="4">
              <Label for="first_name">نام</Label>
              <input
                name="first_name"
                type="text"
                className="form-control"
                disabled={true}
                value={item["نام"]}
              />
            </Col>
            <Col md="4">
              <Label for="last_name">نام خانوادگی</Label>
              <input
                name="last_name"
                type="text"
                className="form-control"
                disabled={true}
                value={item["نام خانوادگی"]}
              />
            </Col>
            <Col md="4" className="mt-1">
              <Label for="mobile">تلفن همراه</Label>
              <input
                name="mobile"
                type="text"
                className="form-control"
                disabled={true}
                value={item["تلفن همراه"]}
              />
            </Col>
            <Col md="4" className="mt-1">
              {currency === "rial" ? (
                <Label for="monthly_charge">شارژ ماهیانه (ریال)</Label>
              ) : (
                <Label for="monthly_charge">شارژ ماهیانه (تومان)</Label>
              )}
              <input
                name="monthly_charge"
                type="text"
                className="form-control"
                disabled={true}
                value={item["شارژ ماهیانه"]
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              />
            </Col>
            <Col md="4" className="mt-1">
              <Label for="ownership">وضعیت</Label>
              <input
                name="ownership"
                type="text"
                className="form-control"
                disabled={true}
                value={item["وضعیت"]}
              />
            </Col>
          </Row>
        </>
      ))}
      {excelData.length > 0 && (
        <div className="mt-3 d-flex justify-content-center w-100">
          <Button
            color="primary"
            type="submit"
            style={{
              minWidth: "150px",
            }}
            onClick={handleSubmit}
          >
            ثبت
          </Button>
        </div>
      )}
    </>
  );
};

export default AddMultipleUnit;
