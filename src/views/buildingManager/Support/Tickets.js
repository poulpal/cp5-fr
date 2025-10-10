import LoadingComponent from "@src/components/LoadingComponent";
import FloatingAddButton from "@src/components/FloatingAddButton";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useEffect } from "react";
import { Badge, Button, Card, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import DataTable from "react-data-table-component";
import moment from "moment-jalaali";
import tableConfig from "../../../configs/tableConfig";
import SupportTicketModal from "../../../components/buildingManager/SupportTicketModal";
import { truncateString } from "../../../utility/Utils";
import { useNavigate } from "react-router-dom";

export default () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [supportTicketModal, setSupportTicketModal] = useState(false);
  const [data, setData] = useState([]);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [sort, setSort] = useState("updated_at");
  const [order, setOrder] = useState("desc");

  const refreshData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/building_manager/supportTickets?paginate=1&page=${page}&perPage=${perPage}&sort=${sort}&order=${order}`
      );
      setData(response.data);
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        console.log(err);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
    return () => {
      setData([]);
    };
  }, [page, perPage, sort, order]);

  const currency = localStorage.getItem("currency");

  const columns = [
    {
      name: "عنوان",
      selector: (row) => row.subject,
      sortable: true,
      cell: (row) => row.subject,
      sortField: "subject",
    },
    {
      name: "وضعیت",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => {
        const color =
          row.status === "closed"
            ? "dark"
            : row.status === "open"
              ? "success"
              : "warning";
        return <Badge color={color}>{
          row.status === "closed"
            ? "بسته شده"
            : row.status === "open"
              ? "باز"
              : "در حال بررسی"
        }</Badge>;
      },
      sortField: "status",
    },
    {
      name: "تاریخ آخرین بروزرسانی",
      selector: (row) => row.updated_at,
      sortable: true,
      cell: (row) => moment(row.updated_at).format("HH:mm jYYYY/jMM/jDD"),
      sortField: "updated_at",
    },
    {
      name: "",
      right: true,
      cell: (row) => (
        <div className="d-md-flex">
          <a
            onClick={() => {
              navigate(`/buildingManager/support/${row.id}`);
            }}
          >
            <Button color="dark" className="mr-2" size="sm" outline>
              مشاهده
            </Button>
          </a>
        </div>
      ),
    },
  ];


  return (
    <>
      <LoadingComponent loading={loading} />
      <SupportTicketModal
        show={supportTicketModal}
        setShow={setSupportTicketModal}
        setLoading={setLoading}
        refreshData={refreshData}
      />
      <Card
        style={{
          minHeight: "89vh",
        }}
      >
        <div className="pb-5 pt-2">
          <h3 className="text-center mb-1">لیست تیکت‌ها</h3>
          <FloatingAddButton
            onClick={() => setSupportTicketModal(true)}
            text="افزودن تیکت جدید"
          />
          <div
            style={{
              float: "left",
              marginLeft: "20px",
            }}
          >
          </div>
          <DataTable
            title="لیست تیکت‌ها"
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
