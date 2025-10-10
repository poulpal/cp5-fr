import React, { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import {
    TreeDataState,
    CustomTreeData,
    IntegratedFiltering,
    SearchState,
    SelectionState,
    FilteringState,
    SummaryState,
    CustomSummary,
    SortingState,
    IntegratedSorting,
} from '@devexpress/dx-react-grid';
import {
    Grid,
    Table,
    TableBandHeader,
    TableColumnVisibility,
    TableFilterRow,
    TableHeaderRow,
    TableSelection,
    TableSummaryRow,
    TableTreeColumn,
    Toolbar,
    VirtualTable,
} from '@devexpress/dx-react-grid-bootstrap4';
import '@devexpress/dx-react-grid-bootstrap4/dist/dx-react-grid-bootstrap4.css';
import axios from "axios";
import { toast } from "react-hot-toast";
import LoadingComponent from '@src/components/LoadingComponent';
import DateRangeSelector from '@src/components/DateRangeSelector';
import {
    TableComponent,
    PriceTypeProvider,
    FilterCell,
    Cell,
    handleExcelData,
    tableMessages,
    tableConfigs,
    TrialColumnsSelector,
} from '@src/components/buildingManager/accounting/tables/tableComponents';
import ExportToExcel from '@src/components/ExportToExcel';
import moment from "moment-jalaali";

const getChildRows = (row, rootRows) => {
    const childRows = rootRows.filter(r => r.parent_id === (row ? row.id : null));
    return childRows.length ? childRows : null;
};

export default () => {
    const [rows, setRows] = useState([]);
    const [columns] = useState([
        {
            name: 'name',
            title: 'حساب',
            getCellValue: row => row.name
        },
        {
            name: 'balance',
            title: 'تراز',
            getCellValue: row => row.balance
        },
    ]);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [selection, setSelection] = useState([]);
    const [sorting, setSorting] = useState([{ columnName: 'created_at', direction: 'asc' }]);
    const [filters, setFilters] = useState([]);

    const [tableColumnExtensions] = useState([
        { columnName: 'no', align: 'center' },
    ]);
    const [filteringStateColumnExtensions] = useState([
        { columnName: 'no', filteringEnabled: false },
    ]);
    const [sortingStateColumnExtensions] = useState([
    ]);
    const [defaultExpandedRowIds, setDefaultExpandedRowIds] = useState([]);
    const [totalSummaryItems] = useState([
    ]);
    const [columnBands] = useState([
    ]);
    const [hiddenColumnNames, setHiddenColumnNames] = useState([
    ]);

    const [page, setPage] = useState(0);
    const [perPage, setPerPage] = useState(20);
    const [rangeStart, setRangeStart] = useState("");
    const [rangeEnd, setRangeEnd] = useState("");

    const refreshData = async () => {
        setLoading(true);
        if (!rangeStart || !rangeEnd) {
            setLoading(false);
            return;
        }
        try {
            const response = await axios.get(`/building_manager/accounting/reports/profitAndLoss?start_date=${rangeStart}&end_date=${rangeEnd}`);
            setData(response.data);
            setRows([
                ...response.data.data.accounts,
                {
                    id: 0,
                    name: response.data.data.pnl > 0 ? "سود" : "زیان",
                    balance: response.data.data.pnl,
                    parent_id: null,
                    type: response.data.data.pnl > 0 ? "profit" : "loss",
                }
            ]);
            setSelection([]);
            setData({
                ...data,
                total: response.data.data.accounts.length
            })
        } catch (err) {
            if (err.response && err.response.data.message) {
                toast.error(err.response.data.message);
            }
        }
        setLoading(false);
    };
    useEffect(() => {
        refreshData();
    }, [rangeStart, rangeEnd]);

    const getTotalSummaryValues = () => {
        const selectedRows = rows;
        return totalSummaryItems.map((summary) => {
            const { columnName, type } = summary;
            return rows.reduce((acc, row) => {
                if (row.parent_id !== null) return acc;
                if (selectedRows.indexOf(row) !== -1) {
                    return acc + parseInt(row[columnName]);
                }
                return acc;
            }, 0);
        });
    };

    return (
        <Paper style={{ borderRadius: "20px", minHeight: "89vh", marginBottom: "20px", paddingBottom: "5px" }}>
            <LoadingComponent loading={loading} />
            <h3 className="text-center mb-0 pt-1 pb-0">صورت سود و زیان</h3>
            <div className="py-1 px-2 d-flex justify-content-between align-items-center">
                <div className='d-flex justify-content-between align-items-center'>
                    <DateRangeSelector setStart={setRangeStart} setEnd={setRangeEnd} accountingStyle={true} />
                </div>
                <div>
                    <ExportToExcel
                        accountingStyle={true}
                        excelData={handleExcelData(rows, columns)}
                        fileName={"ProfitAndLoss_" + moment().format("jYYYY_jMM_jDD")}
                    />
                </div>
            </div>
            <Grid
                rows={rows}
                columns={columns}
            >
                <TreeDataState
                    defaultExpandedRowIds={defaultExpandedRowIds}
                />
                <SelectionState
                    selection={selection}
                    onSelectionChange={(s) => {
                        const lastSelected = s.find(selected => selection.indexOf(selected) === -1);
                        if (lastSelected !== undefined) {
                            setSelection([lastSelected]);
                        }
                    }}

                />
                <CustomTreeData
                    getChildRows={getChildRows}
                />
                <PriceTypeProvider
                    for={["balance"]}
                />
                <VirtualTable
                    tableComponent={TableComponent}
                    cellComponent={props => Cell(props, page, perPage)}
                    columnExtensions={tableColumnExtensions}
                    messages={tableMessages.VirtualTable}
                />
                <TableHeaderRow 
                    // showSortingControls 
                />
                <TableTreeColumn
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
                />
                <TableSelection
                    selectByRowClick
                    highlightRow
                    showSelectionColumn={false}
                />
            </Grid>
        </Paper>
    );
};
