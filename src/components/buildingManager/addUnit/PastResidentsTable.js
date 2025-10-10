import DataTable from "react-data-table-component";
import tableConfig from "../../../configs/tableConfig";

import moment from "moment-jalaali";

const PastResidentsTable = ({
    past_residents
}) => {

    const columns = [
        {
            name: "نام و نام خانوادگی",
            selector: (row) => row.first_name,
            cell: (row) => `${row.first_name ?? ""} ${row.last_name ?? ""}`,
            sortable: false,
        },
        {
            name: "وضعیت",
            selector: (row) => row.ownership,
            cell: (row) => (row.ownership === "owner" ? "مالک" : "مستاجر"),
            sortable: false,
        },
        {
            name: "شماره موبایل",
            selector: (row) => row.mobile,
            sortable: false,
        },
        {
            name: "تاریخ ورود",
            selector: (row) => row.created_at,
            sortable: false,
            cell: (row) => moment(row.created_at).format("jYYYY/jMM/jDD"),
        },
        {
            name: "تاریخ خروج",
            selector: (row) => row.deleted_at,
            sortable: false,
            cell: (row) => row.deleted_at && moment(row.deleted_at).format("jYYYY/jMM/jDD"),
        },
    ]

    return (
        <DataTable
            title="سابقه سکونت"
            columns={columns}
            data={past_residents}
            {...tableConfig}
        />
    );
};

export default PastResidentsTable;
