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

const BuildingCash = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [sort, setSort] = useState("created_at");
    const [order, setOrder] = useState("desc");

    const selectedUnitId = localStorage.getItem("selectedUnit");

    const refreshData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `/user/cash?unit=${selectedUnitId}`
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
        }
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

export default BuildingCash;
