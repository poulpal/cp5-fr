import LoadingComponent from "@src/components/LoadingComponent";
import FloatingAddButton from "@src/components/FloatingAddButton";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useEffect } from "react";
import { Badge, Button, Card, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import DataTable from "react-data-table-component";
import moment from "moment-jalaali";
import tableConfig from "../../configs/tableConfig";
import PriceFormat from "../../components/PriceFormat";
import DepositRequestModal from "../../components/buildingManager/DepositRequestModal";
import ExportToExcel from "../../components/ExportToExcel";
import { truncateString } from "../../utility/Utils";

const Factors = () => {
    const [loading, setLoading] = useState(false);
    const [depositRequestModal, setDepositRequestModal] = useState(false);
    const [data, setData] = useState([]);

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [sort, setSort] = useState("created_at");
    const [order, setOrder] = useState("desc");

    const refreshData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `/building_manager/factors?paginate=1&page=${page}&perPage=${perPage}&sort=${sort}&order=${order}`
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
            name: "تاریخ فاکتور",
            selector: (row) => row.created_at,
            sortable: true,
            cell: (row) => moment(row.created_at).format("jYYYY/jMM/jDD"),
            sortField: "created_at",
        },
        {
            name: "تاریخ سر رسید",
            selector: (row) => row.created_at,
            sortable: true,
            cell: (row) => moment(row.due_date).format("jYYYY/jMM/jDD"),
            sortField: "created_at",
        },
        {
            name: "مبلغ",
            selector: (row) => row.amount,
            sortable: true,
            cell: (row) => <PriceFormat price={row.amount} convertToRial={currency === 'rial'} />,
            sortField: "amount",
        },
        {
            name: "وضعیت",
            selector: (row) => row.status,
            sortable: true,
            cell: (row) => {
                const color =
                    row.status === "pending"
                        ? "warning"
                        : row.status === "canceled"
                            ? "danger"
                            : "success";
                return <Badge color={color}>{row.status === "pending" ? "در انتظار پرداخت" : row.status === "canceled" ? "لغو شده" : "پرداخت شده"}</Badge>;
            },
            sortField: "status",
        },
        {
            name: "",
            cell: (row) => (
                <>
                    <Button color="dark" size="sm" onClick={() => window.open(`${row.url}`)}>
                        مشاهده
                    </Button>
                </>
            ),
        },
    ];

    return (
        <>
            <LoadingComponent loading={loading} />
            <DepositRequestModal
                show={depositRequestModal}
                setShow={setDepositRequestModal}
                setLoading={setLoading}
                refreshData={refreshData}
            />
            <Card
                style={{
                    minHeight: "89vh",
                }}
            >
                <div className="pb-5 pt-2">
                    <h3 className="text-center mb-1">فاکتور ها</h3>
                    <div
                        style={{
                            float: "left",
                            marginLeft: "20px",
                        }}
                    >
                    </div>
                    <DataTable
                        title="فاکتور ها"
                        columns={columns}
                        data={data.data}
                        {...tableConfig}
                    />
                </div>
            </Card>
        </>
    );
};

export default Factors;
