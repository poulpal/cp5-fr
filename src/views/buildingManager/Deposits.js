import { useState } from "react";
import { useEffect } from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-hot-toast";
import axios from "axios";
import PriceFormat from "../../components/PriceFormat";
import {
  Badge,
  Button,
  Card,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  Tooltip,
  UncontrolledDropdown,
} from "reactstrap";
import BlockUi from "@availity/block-ui";
import { useMediaQuery } from "react-responsive";
import Swal from "sweetalert2/dist/sweetalert2.all.js";
import withReactContent from "sweetalert2-react-content";
import "@styles/base/plugins/extensions/ext-component-sweet-alerts.scss";
import tableConfig from "../../configs/tableConfig";
import FloatingAddButton from "../../components/FloatingAddButton";
import moment from "moment-jalaali";
import AddDepositModal from "../../components/buildingManager/addDepositModal";
import ExportToExcel from "../../components/ExportToExcel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faPrint, faTrash } from "@fortawesome/free-solid-svg-icons";
import EditDepositModal from "../../components/buildingManager/EditDepositModal";
import _, { max, method } from 'lodash';
import { isNative, truncateString } from "../../utility/Utils";
import DateRangeSelector from "../../components/DateRangeSelector";
import apiConfig from "../../configs/apiConfig";

const Deposits = () => {
  const [data, setdata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addDepositModal, setAddDepositModal] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [editDepositModal, setEditDepositModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [sort, setSort] = useState("created_at");
  const [order, setOrder] = useState("desc");
  const [search, setSearch] = useState("");

  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");

  useEffect(() => {
    refreshData();
  }, [page, perPage, sort, order, search, rangeStart, rangeEnd]);


  const MySwal = withReactContent(Swal);

  const currency = localStorage.getItem("currency");
  const separateResidentAndOwnerInvoices = JSON.parse(localStorage.getItem("buildingOptions")).separate_resident_and_owner_invoices;

  const refreshData = async () => {
    setLoading(true);
    if (!rangeStart || !rangeEnd) return setLoading(false);
    try {
      const response = await axios.get(
        `/building_manager/invoices?type=deposit&filter=all&paginate=1&page=${page}&perPage=${perPage}&sort=${sort}&order=${order}&search=${search}&start_date=${rangeStart}&end_date=${rangeEnd}`
      );
      setdata(response.data);
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

  const handleSelectedRows = (rows) => {
    setSelectedRows(rows.selectedRows);
  };

  const handleMultipleDelete = () => {
    const ids = selectedRows.map((row) => row.id);
    MySwal.fire({
      title: "آیا از حذف پرداختی ها مطمئن هستید؟",
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
          .post("/building_manager/invoices/multipleDelete", {
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

  let columns = [
    {
      name: "شماره واحد",
      selector: (row) => row.unit.unit_number,
      sortable: true,
      sortField: "unit_number",
    },
    {
      name: "تفکیک",
      selector: (row) => row.resident_type,
      sortable: true,
      omit: !separateResidentAndOwnerInvoices || isNative(),
      sortField: "resident_type",
      cell: (row) => row.resident_type === "owner" ? "مالک" : "ساکن",
    },
    {
      name: "مبلغ",
      selector: (row) => row.amount,
      sortable: true,
      cell: (row) => <PriceFormat price={row.amount} convertToRial={currency === 'rial'} />,
      sortField: "amount",
      maxWidth: "50px",
    },
    {
      name: "نحوه پرداخت",
      selector: (row) => row.payment_method,
      sortable: true,
      cell: (row) =>
        row.payment_method === "پرداخت نقدی" ? (
          <Badge color="dark">پرداخت نقدی</Badge>
        ) : (
          <Badge color="dark">پرداخت آنلاین</Badge>
        ),
      sortField: "payment_method",
      omit: isNative(),
    },
    {
      name: "توضیحات",
      selector: (row) => row.description,
      cell: (row) => <div className="text-warp">{truncateString(row.description, 50)}</div>,
      sortable: true,
      sortField: "description",
      omit: isNative(),
    },
    {
      name: "تاریخ",
      selector: (row) => row.created_at,
      sortable: true,
      cell: (row) => moment(row.created_at).format("jYYYY/jMM/jDD"),
      sortField: "created_at",
      omit: isNative(),
    },
    {
      name: "وضعیت",
      selector: (row) => row.is_verified,
      sortable: true,
      cell: (row) =>
        row.is_verified ? (
          <Badge color="success">تایید شده</Badge>
        ) : (
          <Badge color="dark">در انتظار تایید</Badge>
        ),
      sortField: "is_verified",
      omit: isNative(),
    },
    {
      name: "عملیات",
      selector: (row) => row.id,
      sortable: false,
      right: true,
      cell: (row) => {
        return (
          <div className="d-md-flex">
            <a onClick={() => {
              handleGetReceiptPdf(row.id);
            }}>
              <FontAwesomeIcon icon={faPrint} size="lg" className="text-dark mr-2" />
            </a>
            {!row.is_verified && (
              <Button
                color="success"
                size="sm"
                outline
                onClick={() => {
                  MySwal.fire({
                    title: "تایید پرداختی",
                    text: "آیا از تایید پرداختی اطمینان دارید؟",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "بله",
                    cancelButtonText: "خیر",
                    customClass: {
                      confirmButton: "btn btn-primary",
                      cancelButton: "btn btn-danger ms-1",
                    },
                  }).then(async (result) => {
                    if (result.isConfirmed) {
                      setLoading(true);
                      try {
                        const response = await axios.put(
                          `/building_manager/invoices/${row.id}/verify`
                        );
                        toast.success(response.data.message);
                        refreshData();
                      } catch (err) {
                        if (err.response && err.response.data.message) {
                          toast.error(err.response.data.message);
                        }
                        console.log(err);
                      }
                      setLoading(false);
                    }
                  });
                }}
              >
                تایید
              </Button>
            )}
            {row.payment_method === "پرداخت نقدی" && (
              <a
                className="ms-1"
                onClick={() => {
                  setSelectedDeposit(row);
                  setEditDepositModal(true);
                }}
              >
                <FontAwesomeIcon icon={faPencil} size="lg" className="text-dark mr-2" />
              </a>
            )}
            {row.payment_method === "پرداخت نقدی" && (
              <>
                <a
                  color="danger"
                  className="ms-1"
                  size="sm"
                  outline
                  onClick={() => {
                    MySwal.fire({
                      title: "آیا از حذف پرداختی مطمئن هستید؟",
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
                          .delete("/building_manager/invoices/" + row.id)
                          .then((response) => {
                            toast.success(response.data.message);
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
                  {/* <Button color="danger" className="d-none d-md-block mr-2" size="sm" outline>
                    حذف
                  </Button> */}
                  <FontAwesomeIcon icon={faTrash} size="lg" className="text-danger mr-2" />
                </a>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const handleExcelData = () => {
    const slug = localStorage.getItem("buildingSlug");
    let excelData = [];
    data.data?.forEach((item) => {
      if (slug == "hshcomplex") {
        excelData.push({
          "شماره واحد": item.unit.unit_number,
          "تفکیک": item.resident_type === "owner" ? "مالک" : "ساکن",
          "مبلغ (علی الحساب)": item.amount * (currency === "rial" ? 10 : 1),
          "نحوه پرداخت": item.payment_method,
          توضیحات: item.description,
          تاریخ: moment(item.created_at).format("jYYYY/jMM/jDD"),
          "بانک": item.bank,
          وضعیت: item.is_verified ? "تایید شده" : "در انتظار تایید",
        });
      } else {
        excelData.push({
          "شماره واحد": item.unit.unit_number,
          "تفکیک": item.resident_type === "owner" ? "مالک" : "ساکن",
          مبلغ: item.amount * (currency === "rial" ? 10 : 1),
          "نحوه پرداخت": item.payment_method,
          توضیحات: item.description,
          تاریخ: moment(item.created_at).format("jYYYY/jMM/jDD"),
          "بانک": item.bank,
          وضعیت: item.is_verified ? "تایید شده" : "در انتظار تایید",
        });
      }
    });
    return excelData;
  };

  const handleGetPdf = async (name) => {
    if (isNative() && window.ReactNativeWebView){
      window.ReactNativeWebView.postMessage(JSON.stringify({
        action: "downloadPdf",
        type: "pdf",
        name: name,
        url: `/building_manager/invoices/pdf?type=deposit&filter=all&paginate=1&page=${page}&perPage=${perPage}&sort=${sort}&order=${order}&search=${search}&start_date=${rangeStart}&end_date=${rangeEnd}`,
        token: localStorage.getItem("accessToken"),
        baseUrl: apiConfig.baseUrl,
        method: "GET",
      }));
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`/building_manager/invoices/pdf?type=deposit&filter=all&paginate=1&page=${page}&perPage=${perPage}&sort=${sort}&order=${order}&search=${search}&start_date=${rangeStart}&end_date=${rangeEnd}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", name + ".zip");
      link.click();
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      }
    }
    setLoading(false);
  };

  const handleGetReceiptPdf = async (id) => {
    if (isNative() && window.ReactNativeWebView){
      window.ReactNativeWebView.postMessage(JSON.stringify({
        action: "downloadPdf",
        type: "pdf",
        name: "receipt",
        url: `/building_manager/invoices/${id}/receipt`,
        token: localStorage.getItem("accessToken"),
        baseUrl: apiConfig.baseUrl,
        method: "GET",
      }));
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`/building_manager/invoices/${id}/receipt`, {
        responseType: "blob",
      });
      // stream pdf in new tab
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      window.open(url, "_blank");
      // const url = window.URL.createObjectURL(
      //   new Blob([response.data], { type: "application/pdf" })
      // );
      // const link = document.createElement("a");
      // link.href = url;
      // link.setAttribute("download", "receipt.pdf");
      // link.click();
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      }
    }
    setLoading(false);
  }

  return (
    <Card
      style={{
        minHeight: "89vh",
      }}
    >
      <div className="pb-5 pt-2">
        <BlockUi tag="div" blocking={loading} message={<></>} />
        <AddDepositModal
          show={addDepositModal}
          setShow={setAddDepositModal}
          refreshData={refreshData}
          setLoading={setLoading}
        />
        {selectedDeposit && (
          <EditDepositModal
            show={editDepositModal}
            setShow={setEditDepositModal}
            refreshData={refreshData}
            setLoading={setLoading}
            deposit={selectedDeposit}
          />
        )}
        <h3 className="text-center mb-1">پرداختی ها</h3>
        <p className="text-center mb-1">
          در این بخش، می توانید پرداختی های آنلاین را مشاهده و یا به صورت دستی (تکی یا گروهی) پرداختی جدید را ثبت نمایید
        </p>
        <div className="d-flex">
          <FloatingAddButton
            onClick={() => {
              setAddDepositModal(true);
            }}
            text="افزودن پرداختی"
          />
          {!isNative() && (
            <input
              type="text"
              className="form-control ms-1"
              placeholder="جستجو شماره واحد"
              onChange={(e) => {
                _.debounce(() => {
                  setSearch(e.target.value);
                }, 500)();
              }}
              style={{
                maxWidth: "200px",
                width: "100%",
                height: "30px",
              }}
            />
          )}
          <DateRangeSelector setStart={setRangeStart} setEnd={setRangeEnd} />
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
          <UncontrolledDropdown
            className="me-1"
            direction="down"
          >
            <DropdownToggle
              caret
              color="success"
            >
              خروجی
            </DropdownToggle>
            <DropdownMenu>
              <ExportToExcel
                dropDown={true}
                excelData={handleExcelData()}
                fileName={"Deposits_" + moment().format("jYYYY_jMM_jDD")}
              />
              <DropdownItem onClick={() => {
                handleGetPdf("Deposits_" + moment().format("jYYYY_jMM_jDD"));
              }}>
                خروجی PDF
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </div>
        <DataTable
          title="پرداختی ها"
          columns={columns}
          data={data.data}
          {...tableConfig}
          selectableRows={false}
          onSelectedRowsChange={handleSelectedRows}
          selectableRowDisabled={(row) => row.is_verified}
          paginationServer={true}
          paginationTotalRows={data.total}
          onChangePage={(page) => setPage(page)}
          onChangeRowsPerPage={(perPage) => setPerPage(perPage)}
          sortServer
          onSort={(column, direction) => {
            setSort(column.sortField);
            setOrder(direction);
          }}
          expandableRows
          expandableRowsComponent={({ data }) => (
            <div className="px-2 py-1">
              <div className="">
                <span className="font-weight-bold">شرح :</span>
                <span className="ml-2">{data.description}</span>
              </div>
              {data.payment_method === "پرداخت آنلاین" && (
                <div className="">
                  <span className="font-weight-bold">شماره پیگیری:</span>
                  <span className="ml-2">{data.trace_number}</span>
                </div>
              )}
              <div className="">
                <span className="font-weight-bold">واحد :</span>
                <span className="ml-2">{data.unit?.unit_number}</span>
              </div>
              {data.attachments && data.attachments.length > 0 && (
                <div className="">
                  <span className="font-weight-bold">فایل های پیوست:</span>
                  <br />
                  <span className="ml-2">
                    {data.attachments.map((attachment, index) => (
                      <a
                        href={attachment.file}
                        target="_blank"
                        className="mr-2"
                        key={index}
                      >
                        <img key={index} src={attachment.file} height="200" />
                      </a>
                    ))}
                  </span>
                </div>
              )}
              <>
                <div className="">
                  <span className="font-weight-bold">شیوه پرداخت:</span>
                  <span className="ml-2">
                    <Badge
                      color={
                        data.payment_method === "پرداخت آنلاین"
                          ? "dark"
                          : "dark"
                      }
                    >
                      {data.payment_method}
                    </Badge>
                  </span>
                </div>
                <div className="">
                  <span className="font-weight-bold">وضعیت:</span>
                  <span className="ml-2">
                    <Badge color={data.is_verified ? "success" : "warning"}>
                      {data.is_verified ? "تایید شده" : "در انتظار تایید"}
                    </Badge>
                  </span>
                </div>
                {isNative() && (
                  <>
                  <span>
                    تاریخ: {moment(data.created_at).format("jYYYY/jMM/jDD")}
                  </span>
                  </>
                )}
              </>
            </div>
          )}
          noDataComponent={
            <AddDepositModal
              show={addDepositModal}
              setShow={setAddDepositModal}
              refreshData={refreshData}
              setLoading={setLoading}
              isModal={false}
            />
          }
        />
      </div>
    </Card>
  );
};

export default Deposits;
