import { useState } from "react";
import { useEffect } from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-hot-toast";
import axios from "axios";
import PriceFormat from "../../components/PriceFormat";
import { Badge, Button, Card, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import BlockUi from "@availity/block-ui";
import { useMediaQuery } from "react-responsive";
import Swal from "sweetalert2/dist/sweetalert2.all.js";
import withReactContent from "sweetalert2-react-content";
import "@styles/base/plugins/extensions/ext-component-sweet-alerts.scss";
import tableConfig from "../../configs/tableConfig";
import FloatingAddButton from "../../components/FloatingAddButton";
import moment from "moment-jalaali";
import AddDebtModal from "../../components/buildingManager/debt/addDebtModal";
import ExportToExcel from "@src/components/ExportToExcel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import EditDebtModal from "../../components/buildingManager/EditDebtModal";
import _, { omit } from 'lodash';
import { isNative, truncateString } from "../../utility/Utils";
import DateRangeSelector from "../../components/DateRangeSelector";
import apiConfig from "../../configs/apiConfig";

let currency = 'rial';
let separateResidentAndOwnerInvoices = false;
try {
  currency = localStorage.getItem("currency");
  separateResidentAndOwnerInvoices = JSON.parse(localStorage.getItem("buildingOptions")).separate_resident_and_owner_invoices;
} catch (error) {
  console.log(error);
}

const Debts = () => {
  const [data, setdata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addDebtModal, setAddDebtModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [editDebtModal, setEditDebtModal] = useState(false);
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

  const refreshData = async () => {
    setLoading(true);
    if (!rangeStart || !rangeEnd) return setLoading(false);
    try {
      const response = await axios.get(
        `/building_manager/invoices?type=debt&filter=all&
        paginate=1&page=${page}&perPage=${perPage}&sort=${sort}&order=${order}&search=${search}
        &start_date=${rangeStart}&end_date=${rangeEnd}
        `
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

  const handleExcelData = () => {
    let excelData = [];
    data.data?.forEach((item) => {
      excelData.push({
        "شماره واحد": item.unit.unit_number,
        مبلغ: -1 * item.amount * (currency === "rial" ? 10 : 1),
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
        url: `/building_manager/invoices/pdf?type=debt&filter=all&paginate=1&page=${page}&perPage=${perPage}&sort=${sort}&order=${order}&search=${search}&start_date=${rangeStart}&end_date=${rangeEnd}`,
        token: localStorage.getItem("accessToken"),
        baseUrl: apiConfig.baseUrl,
        method: "GET",
      }));
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`/building_manager/invoices/pdf?type=debt&filter=all&paginate=1&page=${page}&perPage=${perPage}&sort=${sort}&order=${order}&search=${search}&start_date=${rangeStart}&end_date=${rangeEnd}`, {
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
      title: "آیا از حذف بدهی ها مطمئن هستید؟",
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
      name: "سرفصل",
      selector: (row) => row.debtType,
      sortable: true,
      sortField: "debtType",
      omit: isNative(),
      cell: (row) => row.debtType?.name
    },
    {
      name: "مبلغ",
      selector: (row) => row.amount,
      sortable: true,
      cell: (row) => <PriceFormat price={-1 * row.amount} convertToRial={currency === 'rial'} />,
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
      omit: isNative(),
      cell: (row) => moment(row.created_at).format("jYYYY/jMM/jDD"),
      sortField: "created_at",
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
              setSelectedDebt(row);
              setEditDebtModal(true);
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
        <div className="d-md-flex">
          <a
            onClick={() => {
              setSelectedDebt(row);
              setEditDebtModal(true);
            }}
          >
            <Button color="dark" className="d-none mr-2" size="sm" outline>
              ویرایش
            </Button>
            <FontAwesomeIcon icon={faPencil} size="lg" className="text-dark mr-2" />
          </a>
          <a
            color="danger"
            className="ms-1"
            size="sm"
            outline
            onClick={() => {
              MySwal.fire({
                title: "آیا از حذف بدهی مطمئن هستید؟",
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
            <Button color="danger" className="d-none mr-2" size="sm" outline>
              حذف
            </Button>
            <FontAwesomeIcon icon={faTrash} size="lg" className="text-danger mr-2" />
          </a>
        </div>
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
        <AddDebtModal
          show={addDebtModal}
          setShow={setAddDebtModal}
          refreshData={refreshData}
          setLoading={setLoading}
        />
        {selectedDebt && (
          <EditDebtModal
            show={editDebtModal}
            setShow={setEditDebtModal}
            refreshData={refreshData}
            setLoading={setLoading}
            debt={selectedDebt}
          />
        )}
        <h3 className="text-center mb-1">بدهکار / بستانکار</h3>
        <p className="text-center mb-1">برای ساکنین (تکی و گروهی) و یا طرف حساب های مجتمع سند بدهکاری و بستانکاری و یا فاکتور پرداخت ایجاد کنید</p>
        <div className="d-flex w-100">
          <FloatingAddButton
            onClick={() => {
              setAddDebtModal(true);
            }}
            text="افزودن بدهی"
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
                fileName={"Debts_" + moment().format("jYYYY_jMM_jDD")}
              />
              <DropdownItem onClick={() => {
                handleGetPdf("Debts_" + moment().format("jYYYY_jMM_jDD"));
              }}>
                خروجی PDF
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </div>
        <DataTable
          title="بدهی ها"
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
          expandableRows={isNative()}
          expandableRowsComponent={(row) => (
            <ExpandableComponent row={row.data} />
          )}
          noDataComponent={
            <AddDebtModal
              show={addDebtModal}
              setShow={setAddDebtModal}
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

const ExpandableComponent = ({ row }) => {
  return (
    <div className="px-2 py-1">
      {isNative() && (
        <>
          <span>
            سرفصل : {row.debtType?.name}
          </span>
          <br />
          <span>
            توضیحات : {row.description}
          </span>
          <br />
          {separateResidentAndOwnerInvoices ? (
            <>
              <span>
                تفکیک : {row.resident_type === "owner" ? "مالک" : "ساکن"}
              </span>
              <br />
            </>
          ) : (<></>)}
          <span>
            تاریخ : {moment(row.created_at).format("jYYYY/jMM/jDD")}
          </span>
        </>
      )}
    </div>
  );
};

export default Debts;
