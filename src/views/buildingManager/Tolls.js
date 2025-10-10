import { useState } from "react";
import { useEffect } from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-hot-toast";
import axios from "axios";
import PriceFormat from "../../components/PriceFormat";
import { Badge, Button, Card, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import BlockUi from "@availity/block-ui";
import Swal from "sweetalert2/dist/sweetalert2.all.js";
import withReactContent from "sweetalert2-react-content";
import "@styles/base/plugins/extensions/ext-component-sweet-alerts.scss";
import tableConfig from "../../configs/tableConfig";
import FloatingAddButton from "../../components/FloatingAddButton";
import moment from "moment-jalaali";
// import AddTollModal from "../../components/buildingManager/addTollModal";
import ExportToExcel from "@src/components/ExportToExcel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash, faCheck } from "@fortawesome/free-solid-svg-icons";
// import EditTollModal from "../../components/buildingManager/editTollModal";
import _, { omit } from 'lodash';
import { isNative, truncateString } from "../../utility/Utils";
import AddTollModal from "../../components/buildingManager/toll/addTollModal";
import apiConfig from "../../configs/apiConfig";

const Tolls = () => {
  const [data, setdata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addTollModal, setAddTollModal] = useState(false);
  const [selectedToll, setSelectedToll] = useState(null);
  const [editTollModal, setEditTollModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [sort, setSort] = useState("created_at");
  const [order, setOrder] = useState("desc");
  const [search, setSearch] = useState("");
  useEffect(() => {
    refreshData();
  }, [page, perPage, sort, order, search]);

  const MySwal = withReactContent(Swal);

  const currency = localStorage.getItem("currency");

  const refreshData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/building_manager/tolls?paginate=1&page=${page}&perPage=${perPage}&sort=${sort}&order=${order}&search=${search}`
      );
      setdata(response.data);
      if (response.data.data.length === 0) {
        setAddTollModal(true);
      }
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
    let excelData = [];
    data.data?.forEach((item) => {
      excelData.push({
        "شماره واحد": item.unit.unit_number,
        مبلغ: item.amount * (currency === "rial" ? 10 : 1),
        "نحوه پرداخت": item.payment_method,
        توضیحات: item.description,
        تاریخ: moment(item.created_at).format("jYYYY/jMM/jDD"),
      });
    });
    return excelData;
  };

  const handleGetPdf = async (name) => {
    if (isNative() && window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        action: "downloadPdf",
        type: "pdf",
        name: name,
        url: `/building_manager/invoices/pdf?type=toll&filter=all&paginate=1&page=${page}&perPage=${perPage}&sort=${sort}&order=${order}&search=${search}`,
        token: localStorage.getItem("accessToken"),
        baseUrl: apiConfig.baseUrl,
        method: "GET",
      }));
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`/building_manager/invoices/pdf?type=toll&filter=all&paginate=1&page=${page}&perPage=${perPage}&sort=${sort}&order=${order}&search=${search}`, {
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

  const handleSelectedRows = (rows) => {
    setSelectedRows(rows.selectedRows);
  };

  const handleMultipleDelete = () => {
    const ids = selectedRows.map((row) => row.id);
    MySwal.fire({
      title: "آیا از حذف لینک پرداخت مطمئن هستید؟",
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
          .post("/building_manager/tolls/multipleDelete", {
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
      sortField: "resident_type",
      omit: isNative(),
      cell: (row) => row.resident_type === "owner" ? "مالک" : "ساکن",
    },
    {
      name: "مبلغ",
      selector: (row) => row.amount,
      sortable: true,
      cell: (row) => <PriceFormat price={1 * row.amount} convertToRial={currency === 'rial'} />,
      sortField: "amount",
    },
    {
      name: "نحوه پرداخت",
      selector: (row) => row.payment_method,
      sortable: true,
      omit: true,
      cell: (row) =>
        row.payment_method === "پرداخت نقدی" ? (
          <Badge color="info">پرداخت نقدی</Badge>
        ) : (
          <Badge color="success">پرداخت آنلاین</Badge>
        ),
      sortField: "payment_method",
    },
    {
      name: "توضیحات",
      selector: (row) => row.description,
      cell: (row) => <div className="text-warp">{truncateString(row.description, 50)}</div>,
      sortable: true,
      omit: isNative(),
      sortField: "description",
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
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => {
        const color =
          row.status === "pending"
            ? "warning"
            : row.status === "رد شده"
              ? "danger"
              : "success";
        if (row.status === 'رد شده') {
          return <Badge color={color}>در حال بررسی</Badge>;
        }
        return <Badge color={color}>{row.status == 'pending' ? 'در انتظار پرداخت' : 'پرداخت شده'}</Badge>;
      },
      sortField: "status",
      omit: isNative(),
    },
    {
      name: "عملیات",
      selector: (row) => row.id,
      sortable: false,
      right: true,
      omit: true,
      cell: (row) => (
        <div className="d-md-flex">
          <a
            onClick={() => {
              setSelectedToll(row);
              setEditTollModal(true);
            }}
          >
            <Button color="dark" className="d-none d-md-block mr-2" size="sm" outline>
              ویرایش
            </Button>
            <FontAwesomeIcon icon={faPencil} size="lg" className="text-dark d-md-none mr-2" />
          </a>
        </div>
      ),
    },
    {
      name: "عملیات",
      selector: (row) => row.id,
      sortable: false,
      right: true,
      omit: false,
      cell: (row) => (
        row.status === "pending" && (
          <div className="d-flex flex-row flex-md-column align-items-center" style={{
            padding: "3px 0",
          }}>
            <a
              color="success"
              className=""
              style={{
                marginBottom: "3px",
              }}
              size="sm"
              outline
              onClick={() => {
                MySwal.fire({
                  title: "آیا از ثبت پرداخت دستی لینک پرداخت مطمئن هستید؟",
                  text: "این عملیات قابل بازگشت نیست!",
                  icon: "warning",
                  showCancelButton: true,
                  customClass: {
                    confirmButton: "btn btn-success",
                    cancelButton: "btn btn-dark ms-1",
                  },
                  confirmButtonText: "بله، ثبت شود!",
                  cancelButtonText: "انصراف",
                }).then((result) => {
                  if (result.isConfirmed) {
                    setLoading(true);
                    axios
                      .post("/building_manager/tolls/" + row.id + '/cashPay')
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
              <Button color="success" className="d-none d-md-block" size="sm" outline>
                پرداخت دستی
              </Button>
              <FontAwesomeIcon icon={faCheck} size="lg" className="text-success me-1 d-md-none" />
            </a>
            <a
              color="danger"
              className=""
              size="sm"
              outline
              onClick={() => {
                MySwal.fire({
                  title: "آیا از حذف لینک پرداخت مطمئن هستید؟",
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
                      .delete("/building_manager/tolls/" + row.id)
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
              <Button color="danger" className="d-none d-md-block" size="sm" outline>
                حذف
              </Button>
              <FontAwesomeIcon icon={faTrash} size="lg" className="text-danger d-md-none" />
            </a>
          </div>
        )
      ),
    },
  ];

  return (
    <Card
      style={{
        minHeight: "89vh",
      }}
    >
      <div className="pb-5 pt-2">
        <BlockUi tag="div" blocking={loading} message={<></>} />
        <AddTollModal
          show={addTollModal}
          setShow={setAddTollModal}
          refreshData={refreshData}
          setLoading={setLoading}
        />
        {/* {selectedToll && (
          <EditTollModal
            show={editTollModal}
            setShow={setEditTollModal}
            refreshData={refreshData}
            setLoading={setLoading}
            toll={selectedToll}
          />
        )} */}
        <h3 className="text-center mb-1">لینک پرداخت</h3>
        <p className="text-center mb-1">
          در این بخش شما می‌توانید برای ساکنین (به صورت تکی و یا گروهی) و نیز طرف حساب های خود لینک پرداخت ایجاد نمایید و از طریق اس‌ام‌اس و یا سایر پیام رسان ها آن را به اشتراک بگذارید
        </p>
        <div className="d-flex">
          <FloatingAddButton
            onClick={() => {
              setAddTollModal(true);
            }}
            text="افزودن لینک پرداخت"
          />
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
            className="me-1 d-none d-md-block"
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
                fileName={"Tolls_" + moment().format("jYYYY_jMM_jDD")}
              />
              {/* <DropdownItem onClick={() => {
                handleGetPdf("Tolls_" + moment().format("jYYYY_jMM_jDD"));
              }}>
                خروجی PDF
              </DropdownItem> */}
            </DropdownMenu>
          </UncontrolledDropdown>
        </div>
        <DataTable
          title="لینک پرداخت"
          columns={columns}
          data={data.data}
          {...tableConfig}
          selectableRows={false}
          selectableRowDisabled={(row) => row.is_verified}
          onSelectedRowsChange={handleSelectedRows}
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
              <div className="">
                <span className="font-weight-bold">لینک :</span>
                <span className="ml-2">
                  <a href={import.meta.env.VITE_LANDING_URL + "/p/" + data.token} target="_blank">
                    {import.meta.env.VITE_LANDING_URL + "/p/" + data.token}
                  </a>
                </span>
              </div>
              {isNative() && (
                <>
                  <div className="">
                    <span className="font-weight-bold">تفکیک :</span>
                    <span className="ml-2">{data.resident_type === "owner" ? "مالک" : "ساکن"}</span>
                  </div>
                  <div className="">
                    <span className="font-weight-bold">مبلغ :</span>
                    <span className="ml-2">
                      <PriceFormat price={data.amount} convertToRial={currency === "rial"} />
                    </span>
                  </div>
                  <div className="">
                    <span className="font-weight-bold">تاریخ :</span>
                    <span className="ml-2">{moment(data.created_at).format("jYYYY/jMM/jDD")}</span>
                  </div>
                  <div className="">
                    <span className="font-weight-bold">وضعیت :</span>
                    <span className="ml-2">
                      {data.status === "pending" ? "در انتظار پرداخت" : "پرداخت شده"}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        />
      </div>
    </Card>
  );
};

export default Tolls;
