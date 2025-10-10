import * as FileSaver from "file-saver";
import { Button, Col, Label, Row, UncontrolledTooltip } from "reactstrap";
import XLSX from "sheetjs-style-v2";
import { useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { _arrayBufferToBase64, isNative } from "@utils";
import apiConfig from "@configs/apiConfig";

export default ({ setLoading, refreshData, toggleModal, units }) => {
  const [excelData, setExcelData] = useState([]);

  const currency = localStorage.getItem("currency");

  const handleSubmit = async () => {
    setLoading(true);
    let charges = excelData.map((item) => {
      return {
        unit_number: item["شماره واحد"],
        amount: typeof item["شارژ ماهیانه"] == "string" ? item["شارژ ماهیانه"].replace(/,/g, "") : item["شارژ ماهیانه"],
      };
    });
    if (currency === "rial") {
      charges = charges.map((unit) => {
        return {
          ...unit,
          amount: unit.amount / 10,
        };
      });
    }
    try {
      const response = await axios.post(
        "/building_manager/units/setMultipleChargeFee",
        {
          charges,
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
    const excelData = units.map((unit) => {
      return {
        "شماره واحد": unit.unit_number,
        "شارژ ماهیانه": unit.charge_fee * (currency === "rial" ? 10 : 1),
      };
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
        name: "charge_sample" + fileExtension,
        data: _arrayBufferToBase64(excelBuffer),
        url: apiConfig.baseUrl + "/building_manager/excelDownload",
        token: localStorage.getItem("accessToken")
      }));
      return;
    }
    FileSaver.saveAs(data, "charge_sample" + fileExtension);
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
      <div style={{
        maxHeight: '300px',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        {excelData.map((item, index) => (
          <div key={index}>
            <Row>
              <Col sm="6">
                <Label for="unit_number">شماره واحد</Label>
                <input
                  name="unit_number"
                  type="text"
                  className="form-control"
                  disabled={true}
                  value={item['شماره واحد']}
                />
              </Col>
              <Col sm="6">
                <Label for="monthly_charge">شارژ ماهیانه</Label>
                <input
                  type="text"
                  className="form-control"
                  disabled={true}
                  value={item['شارژ ماهیانه'].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                />
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
            onClick={handleSubmit}
          >
            ثبت تغییرات
          </Button>
        </div>
      )}
    </>
  );
};
