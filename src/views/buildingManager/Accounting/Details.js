import React, { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import {
    TreeDataState,
    CustomTreeData,
    IntegratedFiltering,
    SearchState,
    SelectionState,
    FilteringState,
    TableColumnResizing,
} from '@devexpress/dx-react-grid';
import {
    Grid,
    Table,
    TableFilterRow,
    TableHeaderRow,
    TableSelection,
    TableTreeColumn,
    Toolbar,
    VirtualTable,
} from '@devexpress/dx-react-grid-bootstrap4';
import '@devexpress/dx-react-grid-bootstrap4/dist/dx-react-grid-bootstrap4.css';
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { toast } from "react-hot-toast";
import LoadingComponent from '../../../components/LoadingComponent';
import { UncontrolledTooltip } from 'reactstrap';

import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2/dist/sweetalert2.all";

import EditDetailModal from '../../../components/buildingManager/accounting/details/editDetailModal';
import AddDetailModal from '../../../components/buildingManager/accounting/details/addDetailModal';
import { FilterCell } from '../../../components/buildingManager/accounting/tables/tableComponents';

const TableComponent = ({ ...restProps }) => (
    <Table.Table
        {...restProps}
        className="table-bordered accounting-table"
    />
);

const getChildRows = (row, rootRows) => {
    const childRows = rootRows.filter(r => r.parent_id === (row ? row.id : null));
    return childRows.length ? childRows : null;
};

const getRowId = row => row.id;

export default () => {
    const [columns] = useState([
        {
            name: 'name',
            title: 'تفضیل',
            getCellValue: row => row.name
        },
        {
            name: 'code',
            title: 'کد تفضیل',
            getCellValue: row => row.code
        },
        // {
        //     name: 'description',
        //     title: 'شرح',
        //     getCellValue: row => row.description
        // },
        {
            name: 'type',
            title: ' نوع تفضیل',
            getCellValue: row => row.type === 'person' ? 'شخص' : row.type === 'bank' ? 'بانک' : row.type === 'cash' ? 'صندوق' : row.type === 'petty_cash' ? 'تنخواه گردان' : row.type === 'unit' ? 'واحد' : '',
            filterType: 'select',
            filterValues: [
                { value: '', label: 'همه' },
                { value: 'شخص', label: 'شخص' },
                { value: 'واحد', label: 'واحد' },
                { value: 'بانک', label: 'بانک' },
                { value: 'صندوق', label: 'صندوق' },
                { value: 'تنخواه گردان', label: 'تنخواه گردان' },
            ]
        },
    ]);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [selection, setSelection] = useState([]);
    const [query, setQuery] = useState("");

    const [addModal, setAddModal] = useState(false);
    const [editModal, setEditModal] = useState(false);


    const [defaultColumnWidths] = useState([
        { columnName: 'name', width: 550 },
        { columnName: 'code', width: 150 },
        { columnName: 'description', width: 250 },
        { columnName: 'type', width: 150 },
    ]);
    const [tableColumnExtensions] = useState([
        { columnName: 'name', align: 'center' },
        { columnName: 'code', align: 'center' },
        { columnName: 'description', align: 'center' },
        { columnName: 'type', align: 'center' },
    ]);
    const [defaultExpandedRowIds] = useState([]);

    const MySwal = withReactContent(Swal);

    const refreshData = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/building_manager/accounting/details");
            setData(response.data.data.details);
        } catch (err) {
            if (err.response && err.response.data.message) {
                toast.error(err.response.data.message);
            }
        }
        setLoading(false);
    };
    useEffect(() => {
        refreshData();
    }, []);

    return (
        <Paper style={{ borderRadius: "20px", minHeight: "89vh", marginBottom: "20px", paddingBottom: "5px" }}>
            <LoadingComponent loading={loading} />
            <h3 className="text-center mb-0 pt-1 pb-0">تفضیل ها</h3>
            <AddDetailModal show={addModal} setShow={setAddModal} setLoading={setLoading} refreshData={refreshData} allData={data} />
            {data.find((c) => c.id === selection[0]) && (
                <>
                    <EditDetailModal show={editModal} setShow={setEditModal} setLoading={setLoading} refreshData={refreshData} data={data.find((c) => c.id === selection[0])} />
                </>
            )}
            <div className="py-1 px-2 d-flex justify-content-between align-items-center">
                <div>
                </div>
                <div>
                    <FontAwesomeIcon icon={faPlus} size="lg" color="green" id="add-icon" className="clickable" onClick={() => {
                        setAddModal(true);
                    }} />
                    {data.find((c) => c.id === selection[0]) ? (
                        <>
                            <FontAwesomeIcon icon={faPencil} size="lg" color="blue" id="edit-icon" className="clickable" onClick={() => {
                                setEditModal(true);
                            }} />
                            <FontAwesomeIcon icon={faTrash} size="lg" color="red" id="delete-icon" className="clickable" onClick={() => {
                                MySwal.fire({
                                    title: "آیا از حذف این تفضیل مطمئن هستید؟",
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
                                            .delete("/building_manager/accounting/details/" + data.find((c) => c.id === selection[0]).id)
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
                            }} />
                        </>
                    ) : (<>
                        <FontAwesomeIcon icon={faPencil} size="lg" color="grey" id="edit-icon" className="clickable disabled" />
                        <FontAwesomeIcon icon={faTrash} size="lg" color="grey" id="delete-icon" className="clickable disabled" />
                    </>)}
                    <UncontrolledTooltip placement="bottom" target="add-icon">
                        افزودن تفضیل
                    </UncontrolledTooltip>
                    <UncontrolledTooltip placement="bottom" target="edit-icon">
                        ویرایش تفضیل
                    </UncontrolledTooltip>
                    <UncontrolledTooltip placement="bottom" target="delete-icon">
                        حذف تفضیل
                    </UncontrolledTooltip>
                </div>
            </div>
            <Grid
                rows={data}
                columns={columns}
                getRowId={getRowId}
            >
                {/* <TreeDataState
                    defaultExpandedRowIds={defaultExpandedRowIds}
                /> */}
                <FilteringState />
                <SelectionState
                    selection={selection}
                    onSelectionChange={(s) => {
                        const lastSelected = s.find(selected => selection.indexOf(selected) === -1);
                        if (lastSelected !== undefined) {
                            setSelection([lastSelected]);
                        }
                    }}

                />
                {/* <CustomTreeData
                    getChildRows={getChildRows}
                /> */}
                <IntegratedFiltering />
                <VirtualTable
                    tableComponent={TableComponent}
                    columnExtensions={tableColumnExtensions}
                    messages={{
                        noData: "هیچ داده ای یافت نشد",
                    }}
                />
                {/* <TableColumnResizing defaultColumnWidths={defaultColumnWidths} resizingMode={tableConfigs.resizingMode} /> */}
                <TableHeaderRow />
                <TableSelection
                    selectByRowClick
                    highlightRow
                    showSelectionColumn={false}
                />
                <TableFilterRow
                    // showFilterSelector
                    cellComponent={FilterCell}
                    messages={{
                        filterPlaceholder: '',
                        contains: 'شامل',
                        notContains: 'مخالف',
                        startsWith: 'شروع با',
                        endsWith: 'پایان با',
                        equal: 'مساوی',
                        notEqual: 'مخالف',
                        greaterThan: 'بزرگتر',
                        greaterThanOrEqual: 'بزرگتر یا مساوی',
                        lessThan: 'کوچکتر',
                        lessThanOrEqual: 'کوچکتر یا مساوی',
                    }}
                />
                {/* <TableTreeColumn
                    for="name"
                    expandButtonComponent={({ onToggle, expanded, visible }) => (
                        <div style={{ opacity: visible ? 1 : 0 }}>
                            {expanded ? (
                                <i className="oi me-1 oi-chevron-bottom" onClick={onToggle} />
                            ) : (
                                <i className="oi me-1 oi-chevron-left" onClick={onToggle} />
                            )}
                        </div>
                    )}
                    indentComponent={({ level }) => (
                        <div style={{ width: level * 15 }} />
                    )}
                /> */}
                
            </Grid>
        </Paper>
    );
};
