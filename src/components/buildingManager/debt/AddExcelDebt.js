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
import themeConfig from "@configs/themeConfig";

export default ({ units, setLoading, refreshData, toggleModal }) => {
  const [excelData, setExcelData] = useState([]);

  const currency = localStorage.getItem("currency");

  const handleSubmit = async () => {
    setLoading(true);
    let debts = excelData.map((item) => {
      return {
        unit_number: item["شماره واحد"],
        amount: item["مبلغ بدهی"],
        description: item["توضیحات"],
        date: item["تاریخ"],
      };
    });
    if (currency === "rial") {
      debts = debts.map((unit) => {
        return {
          ...unit,
          amount: typeof unit.amount === "string" ? parseInt(unit.amount.replace(/,/g, "")) / 10 : parseInt(unit.amount) / 10,
        };
      });
    }
    try {
      const response = await axios.post(
        "/building_manager/units/addMultipleDebt",
        {
          type: "debt",
          debts,
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
        "مبلغ بدهی": "",
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
        name: "debts_sample" + fileExtension,
        data: _arrayBufferToBase64(excelBuffer),
        url: apiConfig.baseUrl + "/building_manager/excelDownload",
        token: localStorage.getItem("accessToken")
      }));
      return;
    }
    FileSaver.saveAs(data, "debts_sample" + fileExtension);
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
        if (!(item["شماره واحد"] && item["مبلغ بدهی"] && item["توضیحات"])) {
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
      {/* {excelData.length > 0 && (
        <Row>
          <Col md={6}>
            <div className="mt-1">
              <Label>تفکیک :*</Label>
              <Controller
                name="resident_type"
                control={control}
                defaultValue="resident"
                rules={{ required: true }}
                render={({ field }) => (
                  <select {...field} className="form-control">
                    <option value="resident"> ساکن </option>
                    <option value="owner"> مالک </option>
                  </select>
                )}
              />
              {errors.resident_type && (
                <div className="text-danger">تفکیک را مشخص کنید</div>
              )}
            </div>
          </Col>
          <Col md={6}>
            <div className="mt-1">
              <Label>سرفصل :*</Label>
              <Controller
                name="debtType"
                control={control}
                defaultValue={debtTypes[0]}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    styles={{
                      control: (baseStyles, state) => ({
                        ...baseStyles,
                        border: "1px solid" + themeConfig.layout.primaryColor,
                        borderColor: themeConfig.layout.primaryColor,
                        height: "48px",
                        borderRadius: "20px",
                        boxShadow: state.isFocused
                          ? "0 3px 10px 0 rgba(34, 41, 47, 0.1)"
                          : "unset",
                      }),
                    }}
                    noOptionsMessage={() => "..."}
                    placeholder="انتخاب کنید"
                    {...field}
                    isClearable={false}
                    options={debtTypes}
                    getOptionLabel={(option) => option.name}
                    getOptionValue={(option) => option.id}
                  />
                )}
              />
              {errors.debtType && (
                <div className="text-danger">سرفصل را مشخص کنید</div>
              )}
            </div>
          </Col>
        </Row>
      )} */}
      <div style={{
        maxHeight: '300px',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
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
                <Label for="monthly_charge">مبلغ بدهی</Label>
                <input
                  name="monthly_charge"
                  type="text"
                  className="form-control"
                  disabled={true}
                  value={item["مبلغ بدهی"]
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
      </div>
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
