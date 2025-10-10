import { NumericFormat } from "react-number-format";
import { Row, Col, Label, Form, Input, Button, FormGroup } from "reactstrap";
import { useState } from "react";
import { useEffect } from "react";
import * as FileSaver from "file-saver";
import XLSX from "sheetjs-style-v2";
import { toast } from "react-hot-toast";
import axios from "axios";
import moment from "moment-jalaali";
import { _arrayBufferToBase64, isNative } from "../../../utility/Utils";
import apiConfig from "../../../configs/apiConfig";

export default ({ units, setLoading, refreshData, toggleModal }) => {
  const [excelData, setExcelData] = useState([]);

  const currency = localStorage.getItem("currency");
  
  const handleSubmit = async () => {
    setLoading(true);
    let tolls = excelData.map((item) => {
      return {
        unit_number: item["شماره واحد"],
        amount: item["مبلغ لینک پرداخت"],
        description: item["توضیحات"],
        date: item["تاریخ"],
      };
    });
    if (currency === "rial") {
      tolls = tolls.map((unit) => {
        return {
          ...unit,
          amount: unit.amount / 10,
        };
      });
    }
    try {
      const response = await axios.post(
        "/building_manager/units/addMultipleToll",
        {
          type: "toll",
          tolls,
        }
      );
      toast.success(response.data.message);
      refreshData();
      toggleModal();
    } catch (err) {
      console.log(err);
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
    let excelData = [];
    [{ unit_number: 1 }].forEach((unit) => {
      excelData.push({
        "شماره واحد": unit.unit_number,
        "مبلغ لینک پرداخت": "",
        توضیحات: "",
        تاریخ: moment().format("jYYYY/jMM/jDD"),
      });
    });
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
        name: "tolls_sample" + fileExtension,
        data: _arrayBufferToBase64(excelBuffer),
        url: apiConfig.baseUrl + "/building_manager/excelDownload",
        token: localStorage.getItem("accessToken")
      }));
      return;
    }
    FileSaver.saveAs(data, "tolls_sample" + fileExtension);
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
      let is_valid = true;
      data.forEach((item) => {
        if (!(item["شماره واحد"] && item["مبلغ لینک پرداخت"] && item["توضیحات"])) {
          toast.error("فایل اکسل شما معتبر نیست");
          is_valid = false;
        }
      });
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
        <div key={index}>
          <hr className="mt-1" />
          <Row>
            <Col md="3">
              <Label for="unit_number">شماره واحد</Label>
              <input
                name="unit_number"
                type="text"
                className="form-control"
                disabled={true}
                value={item["شماره واحد"]}
              />
            </Col>
            <Col md="3">
              <Label for="monthly_charge">مبلغ لینک پرداخت</Label>
              <input
                name="monthly_charge"
                type="text"
                className="form-control"
                disabled={true}
                value={item["مبلغ لینک پرداخت"]
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              />
            </Col>
            <Col md="3">
              <Label for="description">توضیحات</Label>
              <input
                name="description"
                type="text"
                className="form-control"
                disabled={true}
                value={item["توضیحات"]}
              />
            </Col>
            <Col md="3">
              <div>
                <Label>تاریخ</Label>
                <input
                  name="description"
                  type="text"
                  className="form-control"
                  disabled={true}
                  value={item["تاریخ"]}
                />
              </div>
            </Col>
          </Row>
        </div>
      ))}
      {excelData.length > 0 && (
        <div className="mt-3 d-flex justify-content-center w-100">
          <Button
            color="primary"
            type="submit"
            style={{
              minWidth: "150px",
            }}
            onClick={() => {
              handleSubmit();
            }}
          >
            ثبت
          </Button>
        </div>
      )}
    </>
  );
};
