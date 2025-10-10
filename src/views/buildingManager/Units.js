import { useState } from "react";
import { useEffect } from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-hot-toast";
import axios from "axios";
import PriceFormat from "../../components/PriceFormat";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  Tooltip,
} from "reactstrap";
import BlockUi from "@availity/block-ui";
import { useMediaQuery } from "react-responsive";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faEllipsisVertical,
  faTrash,
  faDownload,
  faPencil,
} from "@fortawesome/free-solid-svg-icons";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Controller, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import Swal from "sweetalert2/dist/sweetalert2.all.js";
import withReactContent from "sweetalert2-react-content";
import "@styles/base/plugins/extensions/ext-component-sweet-alerts.scss";
import UnitDetailModal from "../../components/buildingManager/UnitDetailModal";
import AddUnitModal from "../../components/buildingManager/addUnit/addUnitModal";
import tableConfig from "../../configs/tableConfig";
import FloatingAddButton from "../../components/FloatingAddButton";
import ExportToExcel from "@src/components/ExportToExcel";
import moment from "moment-jalaali";
import { omit } from "lodash";
import { isNative } from "../../utility/Utils";
import SetChargeModal from "@src/components/buildingManager/addUnit/SetCharge/SetChargeModal";

const buildingOptions = JSON.parse(localStorage.getItem("buildingOptions") || "{}");
const isMultiBalance = buildingOptions.multi_balance || false;
const hasRent = buildingOptions.has_rent || false;

const Units = () => {
  const [data, setdata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addUnitModal, setAddUnitModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [unitDetailModal, setUnitDetailModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [setChargeModal, setSetChargeModal] = useState(false);

  const ismobile = false;

  const MySwal = withReactContent(Swal);


  const refreshData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/building_manager/units?withResidents=1");
      setdata(response.data.data.units);
      setFilteredData(response.data.data.units);
      // if (response.data.data.units.length === 0) {
      //   setAddUnitModal(true);
      // }
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      }
      console.log(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
    return () => {
      setdata([]);
    };
  }, []);

  const handleExcelData = () => {
    let exdata = [];
    filteredData.map((item) => {
      let residentsString = "";
      item.residents.map((resident) => {
        residentsString = residentsString.concat(
          resident.first_name +
          " " +
          resident.last_name +
          ` (${resident.ownership == "owner" ? "مالک" : "مستاجر"}) ` +
          " - " +
          resident.mobile +
          "\n"
        );
      });
      exdata.push({
        "شماره واحد": item.unit_number,
        "مبلغ شارژ ماهیانه (ریال)": item.charge_fee * 10,
        "بدهی (ریال)": item.charge_debt * 10,
        "مساحت": item.area,
        "تعداد نفرات": item.resident_count,
        ساکنین: residentsString,
      });
    });
    return exdata;
  };

  const handleSelectedRows = (rows) => {
    setSelectedRows(rows.selectedRows);
  };

  const handleMultipleDelete = () => {
    const ids = selectedRows.map((row) => row.id);
    MySwal.fire({
      title: "آیا از حذف واحد ها مطمئن هستید؟",
      text: "این عملیات قابل بازگشت نیست!",
      icon: "warning",
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-danger",
        cancelButton: "btn btn-dark ms-1",
      },
      confirmButtonText: "بله، حذف شود!",
      cancelButtonText: "انصراف",
    }).then((result) => {
      if (result.isConfirmed) {
        setLoading(true);
        axios
          .post("/building_manager/units/multipleDelete", {
            ids,
          })
          .then((response) => {
            toast.success(response.data.message);
            refreshData();
            setSelectedRows([]);
          })
          .catch((err) => {
            if (err.response && err.response.data.message) {
              toast.error(err.response.data.message);
            }
            console.log(err);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    });
  };

  const currency = localStorage.getItem("currency");

  let columns = [
    {
      name: "شماره واحد",
      selector: (row) => row.unit_number,
      sortable: true,
      sortFunction: (a, b) => {
        return a.unit_number - b.unit_number;
      },
    },
    {
      name: "مساحت",
      selector: (row) => row.area,
      sortable: true,
      sortFunction: (a, b) => {
        return a.area - b.area;
      },
      omit: isNative(),
    },
    {
      name: "تعداد نفرات",
      selector: (row) => row.resident_count,
      sortable: true,
      sortFunction: (a, b) => {
        return a.resident_count - b.resident_count;
      },
      omit: isNative(),
    },
    {
      name: "ساکنین",
      selector: (row) => row.residents,
      sortable: false,
      omit: true,
      cell: (row) => (
        <div>
          {row.residents.map((resident) => (
            <div key={resident.id}>
              {resident.first_name} {resident.last_name} - {resident.mobile}
            </div>
          ))}
        </div>
      ),
    },
    {
      name: "مبلغ شارژ ماهیانه",
      selector: (row) => row.charge_fee,
      sortable: true,
      omit: isNative(),
      cell: (row) => <PriceFormat price={row.charge_fee} convertToRial={currency === "rial"} />,
    },
    {
      name: "مبلغ اجاره ماهیانه",
      selector: (row) => row.rent_fee,
      sortable: true,
      omit: !hasRent || isNative(),
      cell: (row) => <PriceFormat price={row.rent_fee} convertToRial={currency === "rial"} />,
    },
    {
      name: "بدهی",
      selector: (row) => row.charge_debt,
      sortable: true,
      cell: (row) =>
        row.charge_debt > 0 && <PriceFormat price={row.charge_debt} convertToRial={currency === "rial"} />,
    },
    {
      name: "صندوق",
      selector: (row) => row.balance?.title,
      sortable: false,
      omit: !isMultiBalance || isNative(),

    },
    {
      name: "",
      selector: (row) => row.id,
      sortable: false,
      right: true,
      cell: (row) => (
        <div className="d-md-flex">
          <a
            onClick={() => {
              setSelectedUnit(row);
              setUnitDetailModal(true);
            }}
          >
            <FontAwesomeIcon icon={faPencil} size="lg" className="text-dark mr-2" />
          </a>
          <a
            color="danger"
            className="ms-1"
            size="sm"
            outline
            onClick={() => {
              MySwal.fire({
                title: "آیا از حذف واحد مطمئن هستید؟",
                text: "این عملیات قابل بازگشت نیست!",
                icon: "warning",
                showCancelButton: true,
                customClass: {
                  confirmButton: "btn btn-danger",
                  cancelButton: "btn btn-dark ms-1",
                },
                confirmButtonText: "بله، حذف شود!",
                cancelButtonText: "انصراف",
              }).then((result) => {
                if (result.isConfirmed) {
                  setLoading(true);
                  axios
                    .delete("/building_manager/units/" + row.id)
                    .then((response) => {
                      toast.success(response.data.message);
                      setdata(data.filter((unit) => unit.id !== row.id));
                      refreshData();
                    })
                    .catch((err) => {
                      if (err.response && err.response.data.message) {
                        toast.error(err.response.data.message);
                      }
                      console.log(err);
                    })
                    .finally(() => {
                      setLoading(false);
                    });
                }
              });
            }}
          >
            <FontAwesomeIcon icon={faTrash} size="lg" className="text-danger mr-2" />
          </a>
        </div>
      ),
    },
  ];

  const refreshFilteredData = (search) => {
    if (search == "" || search == null) {
      setFilteredData(data);
    }
    const filteredUnits = data.filter((unit) => {
      return unit.unit_number.includes(search);
    });
    setFilteredData(filteredUnits);
  };

  return (
    <Card
      style={{
        minHeight: "89vh",
      }}
    >
      <div className="pb-5 pt-2">
        <BlockUi tag="div" blocking={loading} message={<></>} />
        {selectedUnit && (
          <UnitDetailModal
            unit={selectedUnit}
            unitDetailModal={unitDetailModal}
            setUnitDetailModal={setUnitDetailModal}
            setLoading={setLoading}
            refreshData={refreshData}
          />
        )}
        <AddUnitModal
          addUnitModal={addUnitModal}
          setAddUnitModal={setAddUnitModal}
          setLoading={setLoading}
          refreshData={refreshData}
        />
        <SetChargeModal
          showModal={setChargeModal}
          setShowModal={setSetChargeModal}
          setLoading={setLoading}
          refreshData={refreshData}
          units={data}
        />
        <h3 className="text-center mb-1">واحدها</h3>
        <div className="d-flex">
          <FloatingAddButton
            onClick={() => setAddUnitModal(true)}
            text="افزودن واحد"
          />
          <FloatingAddButton
            onClick={() => setSetChargeModal(true)}
            text="تنظیم شارژ"
            plusIcon={false}
          />
          <input
            type="text"
            className="form-control ms-1"
            placeholder="جستجو شماره واحد"
            onChange={(e) => {
              refreshFilteredData(e.target.value);
            }}
            style={{
              maxWidth: "200px",
              width: "100%",
              height: "30px",
            }}
          />
        </div>
        <div
          style={{
            float: "left",
            marginLeft: "20px",
          }}
        >
          {selectedRows.length > 0 && (
            <>
              <Button
                size="sm"
                color="danger"
                style={{
                  marginLeft: "5px",
                }}
                onClick={handleMultipleDelete}
              >
                حذف ردیف های انتخاب شده
              </Button>
            </>
          )}
          <ExportToExcel
            excelData={handleExcelData()}
            fileName={"Units_" + moment().format("jYYYY_jMM_jDD")}
          />
        </div>
        <DataTable
          title="واحدها"
          columns={columns}
          data={filteredData}
          {...tableConfig}
          // selectableRows
          onSelectedRowsChange={handleSelectedRows}
          expandableRows
          expandableRowsComponent={(row) => (
            <ExpandableComponent row={row.data} />
          )}
          noDataComponent={<AddUnitModal
            addUnitModal={addUnitModal}
            setAddUnitModal={setAddUnitModal}
            setLoading={setLoading}
            refreshData={refreshData}
            isModal={false}
          />}
        />
      </div>
    </Card>
  );
};

const ExpandableComponent = ({ row }) => {
  return (
    <div className="px-2 py-1">
      {isNative() && (
        <>
          <span>
            مبلغ شارژ ماهیانه :{" "}
            <PriceFormat price={row.charge_fee} convertToRial={localStorage.getItem("currency") === "rial"} />
          </span>
          <br />
          {hasRent && (
            <>
              <span>
                مبلغ اجاره ماهیانه :{" "}
                <PriceFormat price={row.rent_fee} convertToRial={localStorage.getItem("currency") === "rial"} />
              </span>
              <br />
            </>
          )}
          <span>
            مساحت : {row.area}
          </span>
          <br />
          <span>
            تعداد نفرات : {row.resident_count}
          </span>
          <br />
          {isMultiBalance && (
            <>
              <span>
                صندوق : {row.balance?.title}
              </span>
              <br />
            </>
          )}
        </>
      )}
      <span>
        لینک پرداخت واحد :<br />
        <a href={`${import.meta.env.VITE_LANDING_URL}/b${row.token}`}>{import.meta.env.VITE_LANDING_URL}/b{row.token}</a>
      </span>
      <hr />
      <span className="d-flex flex-column justify-content-center">
        <CopyToClipboard
          text={`${import.meta.env.VITE_LANDING_URL}/b${row.token}`}
          onCopy={() => toast.success("لینک کپی شد")}
        >
          <QRCodeCanvas
            value={`${import.meta.env.VITE_LANDING_URL}/b${row.token}`}
            size="512"
            style={{
              maxWidth: "200px",
              width: "100%",
            }}
          />
        </CopyToClipboard>
        <span>
          <Button
            className="mt-2"
            color="primary"
            onClick={() => {
              const canvas = document.querySelector("canvas");
              const pngUrl = canvas
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream");
              let downloadLink = document.createElement("a");
              downloadLink.href = pngUrl;
              downloadLink.download = `unit_${row.unit_number}.png`;
              document.body.appendChild(downloadLink);
              downloadLink.click();
              document.body.removeChild(downloadLink);
            }}
          >
            <FontAwesomeIcon icon={faDownload} /> دانلود QR
          </Button>
        </span>
      </span>
      <hr />
    </div>
  );
};

export default Units;
