import { faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import * as FileSaver from "file-saver";
import { Button, DropdownItem, UncontrolledTooltip } from "reactstrap";
import XLSX from "sheetjs-style-v2";
import { _arrayBufferToBase64, isNative } from "../utility/Utils";
import apiConfig from "../configs/apiConfig";

const ExportToExcel = ({ excelData, fileName, dropDown = false, accountingStyle = false }) => {
  const handleExport = () => {
    fileName = fileName.replace(/\//g, "_");
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = {
      Sheets: { data: ws }, SheetNames: ["data"], Workbook: {
        Views: [
          { RTL: true }
        ]
      }
    };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: fileType });
    if (isNative() && window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        action: "downloadExcel",
        type: "xlsx",
        name: fileName,
        data: _arrayBufferToBase64 (excelBuffer),
        url: apiConfig.baseUrl + "/building_manager/excelDownload",
        token: localStorage.getItem("accessToken")
      }));
      return;
    }
    FileSaver.saveAs(blob, fileName + fileExtension);
  };

  // if (isNative()) return <></>;

  const buildingOptions = JSON.parse(localStorage.getItem("buildingOptions"));
  const canExport = buildingOptions ? buildingOptions.excel_export : false;
  if (!canExport) return <></>;

  if (accountingStyle) {
    return (
      <>
        {(excelData.length == 0) ?
          <FontAwesomeIcon icon={faFileExcel} size="lg" color="grey" id="excel-icon" className="clickable disabled" />
          : (
            <FontAwesomeIcon icon={faFileExcel} size="lg" color="green" id="excel-icon" className="clickable" onClick={() => {
              handleExport();
            }} />
          )}
        <UncontrolledTooltip placement="bottom" target="excel-icon">
          خروجی اکسل
        </UncontrolledTooltip>
      </>
    );
  }

  if (excelData.length == 0) return <></>;
  return (
    <>
      {/* <UncontrolledTooltip placement="bottom" target="export">
        خروجی اکسل
      </UncontrolledTooltip> */}
      {!dropDown && (
        <Button
          id="export"
          href="#"
          color="success"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            handleExport();
          }}
        >
          <span>خروجی Excel</span>
        </Button>
      )}
      {dropDown && (
        <DropdownItem
          onClick={(e) => {
            e.preventDefault();
            handleExport();
          }}
        >
          <span>خروجی Excel</span>
        </DropdownItem>
      )}
    </>
  );
};

export default ExportToExcel;
