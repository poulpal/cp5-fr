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
import AddCostModal from "../../components/buildingManager/addCostModal";
import ExportToExcel from "@src/components/ExportToExcel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import EditCostModal from "../../components/buildingManager/EditCostModal";
import _, { omit } from 'lodash';
import { truncateString } from "../../utility/Utils";
import DateRangeSelector from "../../components/DateRangeSelector";

export default () => {
  const [data, setdata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addCostModal, setAddCostModal] = useState(false);
  const [selectedCost, setSelectedCost] = useState(null);
  const [editCostModal, setEditCostModal] = useState(false);
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

  const selectedUnitId = localStorage.getItem("selectedUnit");

  const refreshData = async () => {
    setLoading(true);
    if (!rangeStart || !rangeEnd) return setLoading(false);
    try {
      const response = await axios.get(
        `user/costs?type=cost&filter=all&paginate=1&page=${page}&perPage=${perPage}&sort=${sort}&order=${order}
        &start_date=${rangeStart}&end_date=${rangeEnd}&unit=${selectedUnitId}`
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
        مبلغ: -1 * item.amount * 10,
        توضیحات: item.description,
        تاریخ: moment(item.created_at).format("jYYYY/jMM/jDD"),
      });
    });
    return excelData;
  };

  const handleGetPdf = async (name) => {
    setLoading(true);
    try {
      const response = await axios.get(`/building_manager/invoices/pdf?type=cost&filter=all&paginate=1&page=${page}&perPage=${perPage}&sort=${sort}&order=${order}&search=${search}&start_date=${rangeStart}&end_date=${rangeEnd}&unit=${selectedUnitId}`, {
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
      title: "آیا از حذف هزینه ها مطمئن هستید؟",
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
      name: "مبلغ",
      selector: (row) => row.amount,
      sortable: true,
      cell: (row) => <PriceFormat price={-1 * row.amount} />,
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
      sortField: "description",
    },
    {
      name: "تاریخ",
      selector: (row) => row.created_at,
      sortable: true,
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
              setSelectedCost(row);
              setEditCostModal(true);
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
      omit: true,
      cell: (row) => (
        <div className="d-md-flex">
          <a
            onClick={() => {
              setSelectedCost(row);
              setEditCostModal(true);
            }}
          >
            <FontAwesomeIcon icon={faPencil} size="lg" className="text-dark mr-2" />
          </a>
          <a
            color="danger"
            className="ms-1"
            size="sm"
            onClick={() => {
              MySwal.fire({
                title: "آیا از حذف هزینه مطمئن هستید؟",
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
        {/* <AddCostModal
          show={addCostModal}
          setShow={setAddCostModal}
          refreshData={refreshData}
          setLoading={setLoading}
        />
        {selectedCost && (
          <EditCostModal
            show={editCostModal}
            setShow={setEditCostModal}
            refreshData={refreshData}
            setLoading={setLoading}
            cost={selectedCost}
          />
        )} */}
        <h3 className="text-center mb-1">هزینه ها</h3>
        <div className="d-flex">
          {/* <FloatingAddButton
            onClick={() => {
              setAddCostModal(true);
            }}
            text="افزودن هزینه"
          /> */}
          {/* <input
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
          /> */}
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
          {/* <UncontrolledDropdown
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
                fileName={"Costs_" + moment().format("jYYYY_jMM_jDD")}
              />
              <DropdownItem onClick={() => {
                handleGetPdf("Costs_" + moment().format("jYYYY_jMM_jDD"));
              }}>
                خروجی PDF
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown> */}
        </div>
        <DataTable
          title="هزینه ها"
          columns={columns}
          data={data.data}
          {...tableConfig}
          // selectableRows
          selectableRowDisabled={(row) => true}
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
        />
      </div>
    </Card>
  );
};