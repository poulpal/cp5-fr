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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ChangeCashBalanceModal from "../../components/buildingManager/cash/ChangeCashBalanceModal";

const Cash = () => {
    const [loading, setLoading] = useState(false);
    const [depositRequestModal, setDepositRequestModal] = useState(false);
    const [data, setData] = useState([]);
    const [selectedCash, setSelectedCash] = useState(null);
    const [changeCashBalanceModal, setChangeCashBalanceModal] = useState(false);

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [sort, setSort] = useState("created_at");
    const [order, setOrder] = useState("desc");

    const refreshData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `/building_manager/cash`
            );
            setData(response.data.data.cashs);
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
            selector: (row) => row.name,
            sortable: false,
        },
        {
            name: "موجودی",
            selector: (row) => row.balance,
            sortable: false,
            cell: (row) => <PriceFormat price={row.balance} convertToRial={currency === 'rial'} />,
        },
        {
            name: "عملیات",
            selector: (row) => row.id,
            sortable: false,
            right: true,
            cell: (row) =>
                !row.is_locked &&
                (
                    <div className="d-md-flex">
                        <a
                            onClick={() => {
                                setSelectedCash(row);
                                setChangeCashBalanceModal(true);
                            }}
                        >
                            <Button color="dark" outline className="btn-icon btn-sm">
                                تغییر موجودی
                            </Button>
                        </a>
                    </div>
                ),
        },
    ];

    return (
        <>
            <LoadingComponent loading={loading} />
            {selectedCash && (
                <ChangeCashBalanceModal
                    show={changeCashBalanceModal}
                    setShow={setChangeCashBalanceModal}
                    cash={selectedCash}
                    refreshData={refreshData}
                    setLoading={setLoading}
                />
            )}
            <Card
                style={{
                    minHeight: "89vh",
                }}
            >
                <div className="pb-5 pt-2">
                    <h3 className="text-center mb-1">موجودی نقد</h3>
                    <div
                        style={{
                            float: "left",
                            marginLeft: "20px",
                        }}
                    >
                    </div>
                    <DataTable
                        title="موجودی نقد"
                        columns={columns}
                        data={data}
                        {...tableConfig}
                    />
                </div>
            </Card>
        </>
    );
};

export default Cash;
