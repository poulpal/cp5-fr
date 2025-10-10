import { useState } from "react";
import { useEffect } from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-hot-toast";
import axios from "axios";
import FloatingAddButton from "../../components/FloatingAddButton";
import { Button, Card } from "reactstrap";
import tableConfig from "../../configs/tableConfig";
import { useMediaQuery } from "react-responsive";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2/dist/sweetalert2.all";

import AddStockModal from "@src/components/buildingManager/stocks/addStockModal";
import LoadingComponent from "../../components/LoadingComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisVertical,
  faEye,
  faPencil,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import EditStockModal from "../../components/buildingManager/stocks/editStockModal";
import moment from "moment-jalaali";

import { TableComponent, PriceTypeProvider, FilterCell, Cell, handleExcelData, tableMessages, tableConfigs } from '@src/components/buildingManager/accounting/tables/tableComponents';
import PriceFormat from "../../components/PriceFormat";
import AddTransactionModal from "../../components/buildingManager/stocks/addTransactionModal";
import TransactionsModal from "../../components/buildingManager/stocks/transactionsModal";

export default () => {
  const currency = localStorage.getItem("currency");

  const [data, setdata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addStockModal, setAddStockModal] = useState(false);
  const [editStockModal, setEditStockModal] = useState(false);
  const [transactionsModal, setTransactionsModal] = useState(false);
  const [addTransactionModal, setAddTransactionModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [sort, setSort] = useState("id");
  const [order, setOrder] = useState("desc");

  const MySwal = withReactContent(Swal);

  const selectedUnitId = localStorage.getItem("selectedUnit");  

  const refreshData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/user/stocks?paginate=1&page=${page}&perPage=${perPage}&sort=${sort}&order=${order}&unit=${selectedUnitId}`);
      setdata(response.data);
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, [page, perPage, sort, order]);

  const columns = [
    {
      name: "شماره",
      selector: (row) => row.invoice_number,
      sortable: true,
      sortField: "invoice_number",
    },
    {
      name: "نام",
      selector: (row) => row.title,
      sortable: true,
      sortField: "title",
    },
    // {
    //   name: "شرح",
    //   selector: (row) => row.description,
    //   sortable: true,
    //   sortField: "description",
    // },
    {
      name: "موجودی اولیه",
      selector: (row) => row.quantity,
      sortable: true,
      sortField: "quantity",
    },
    {
      name: "افزایش",
      selector: (row) => row.incremented_quantity,
      sortable: false,
    },
    {
      name: "کاهش",
      selector: (row) => row.decremented_quantity,
      sortable: false,
    },
    {
      name: "تعداد",
      selector: (row) => row.available_quantity,
      sortable: false,
    },
    {
      name: "مبلغ",
      selector: (row) => <PriceFormat price={row.total_price} convertToRial={currency === 'rial'} />,
      sortable: false,
    },
    {
      name: "عملیات",
      selector: (row) => row.id,
      sortable: false,
      right: true,
      omit: true,
      cell: (row) => (
        <div className="d-md-flex flex-column align-items-center">
          <a
            onClick={() => {
              setSelectedStock(row);
              setAddTransactionModal(true);
            }}
          >
            <Button color="success" className="me-1" size="sm" outline>
              تغییر موجودی
            </Button>
          </a>
          <a
            onClick={() => {
              setSelectedStock(row);
              setTransactionsModal(true);
            }}
          >
            <Button color="dark" className="me-1" size="sm" outline>
              تراکنش ها
            </Button>
          </a>

          {/* <a
            onClick={() => {
              setSelectedStock(row);
              setEditStockModal(true);
            }}
          >
            {ismobile ? (
              <FontAwesomeIcon icon={faEye} size="lg" />
            ) : (
              <Button color="dark" className="mr-2" size="sm" outline>
                ویرایش
              </Button>
            )}
          </a> */}
          {/* <a
            color="danger"
            className="ms-1"
            size="sm"
            outline
            onClick={() => {
              MySwal.fire({
                title: "آیا از حذف کالا مطمئن هستید؟",
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
                    .delete("/building_manager/stocks/" + row.id)
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
            {ismobile ? (
              <FontAwesomeIcon icon={faTrash} size="lg" color="red" />
            ) : (
              <Button color="danger" className="mr-2" size="sm" outline>
                حذف
              </Button>
            )}
          </a> */}
        </div>
      ),
    },
  ];

  return (
    <>
      <LoadingComponent loading={loading} />
      <Card
        style={{
          minHeight: "89vh",
        }}
      >
        <div className="pb-5 pt-2">
          <h3 className="text-center mb-1">انبار</h3>
          {/* <FloatingAddButton onClick={() => setAddStockModal(true)} text="افزودن کالا" /> */}
          <DataTable
            title="انبارداری"
            columns={columns}
            data={data.data}
            {...tableConfig}
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
    </>
  );
};

