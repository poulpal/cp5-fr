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

const getRowId = row => row.id;
const getChildRows = (row, rootRows) => {
    const childRows = rootRows.filter(
        r => r.parent_id == (row ? row.id : null)
    );
    if (childRows.length) {
        return childRows;
    }
    return row && row.hasItems ? [] : null;
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
            name: 'code',
            title: 'کد حساب',
            getCellValue: row => row.code
        },
        {
            name: 'remaining_debit',
            title: 'مانده بدهکار',
            getCellValue: row => row.remaining_debit
        },
        {
            name: 'remaining_credit',
            title: 'مانده بستانکار',
            getCellValue: row => row.remaining_credit
        },
        {
            name: 'debit',
            title: 'گردش بدهکار',
            getCellValue: row => row.debit
        },
        {
            name: 'credit',
            title: 'گردش بستانکار',
            getCellValue: row => row.credit
        },
        {
            name: 'debit_balance',
            title: 'تراز بدهکار',
            getCellValue: row => row.debit_balance
        },
        {
            name: 'credit_balance',
            title: 'تراز بستانکار',
            getCellValue: row => row.credit_balance
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
        { columnName: 'no', sortingEnabled: false },
        { columnName: 'account', sortingEnabled: false },
        { columnName: 'description', sortingEnabled: false },
    ]);
    const [defaultExpandedRowIds, setDefaultExpandedRowIds] = useState([]);
    const [totalSummaryItems] = useState([
        { columnName: 'remaining_debit', type: 'sum' },
        { columnName: 'remaining_credit', type: 'sum' },
        { columnName: 'debit', type: 'sum' },
        { columnName: 'credit', type: 'sum' },
        { columnName: 'debit_balance', type: 'sum' },
        { columnName: 'credit_balance', type: 'sum' },
    ]);
    const [columnBands] = useState([
        {
            title: 'گردش حساب',
            children: [
                { columnName: 'debit', title: 'بدهکار' },
                { columnName: 'credit', title: 'بستانکار' },
            ],
        },
        {
            title: 'مانده از قبل',
            children: [
                { columnName: 'remaining_debit', title: 'بدهکار' },
                { columnName: 'remaining_credit', title: 'بستانکار' },
            ],
        },
        {
            title: 'تراز',
            children: [
                { columnName: 'debit_balance', title: 'بدهکار' },
                { columnName: 'credit_balance', title: 'بستانکار' },
            ],
        },
    ]);
    const [hiddenColumnNames, setHiddenColumnNames] = useState([
        'debit_balance',
        'credit_balance',
        'remaining_debit',
        'remaining_credit',
    ]);
    const [expandedRowIds, setExpandedRowIds] = useState([]);

    const [page, setPage] = useState(0);
    const [perPage, setPerPage] = useState(20);
    const [rangeStart, setRangeStart] = useState("");
    const [rangeEnd, setRangeEnd] = useState("");


    const loadData = () => {
        const rowIdsWithNotLoadedChilds = [null, ...expandedRowIds]
            .filter(rowId => rows.findIndex(row => row.parent_id === rowId) === -1);
        if (rowIdsWithNotLoadedChilds.length) {
            if (loading) return;
            rowIdsWithNotLoadedChilds.forEach(async (rowId) => {
                try {
                    setLoading(true);
                    if (!rangeStart || !rangeEnd) return setLoading(false);
                    const response = await axios.get(`/building_manager/accounting/reports/trialBalance?start_date=${rangeStart}&end_date=${rangeEnd}&parent_id=${rowId || ""}`);
                    setRows(rows.concat(response.data.data.accounts));
                    setLoadedRows(loadedRows.concat(rowId));
                    setLoading(false);
                } catch (err) {
                    if (err.response && err.response.data.message) {
                        toast.error(err.response.data.message);
                    }
                    setLoading(false);
                }
            });
        }
    };

    const refreshData = async () => {
        setLoading(true);
        if (!rangeStart || !rangeEnd) return setLoading(false);
        try {
            const response = await axios.get(`/building_manager/accounting/reports/trialBalance?start_date=${rangeStart}&end_date=${rangeEnd}`);
            setData(response.data);
            setRows(response.data.data.accounts);
            setSelection([]);
            setExpandedRowIds([]);
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
        loadData();
    }, [expandedRowIds]);
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
            <h3 className="text-center mb-0 pt-1 pb-0">تراز آزمایشی</h3>
            <div className="py-1 px-2 d-flex justify-content-between align-items-center">
                <div className='d-flex justify-content-between align-items-center'>
                    <DateRangeSelector setStart={setRangeStart} setEnd={setRangeEnd} accountingStyle={true} />
                    <TrialColumnsSelector setHiddenColumnNames={setHiddenColumnNames} hiddenColumnNames={hiddenColumnNames} />
                </div>
                <div>
                    <ExportToExcel
                        accountingStyle={true}
                        excelData={handleExcelData(rows, columns)}
                        fileName={"TrialBalance_" + moment().format("jYYYY_jMM_jDD")}
                    />
                </div>
            </div>
            <Grid
                rows={rows}
                columns={columns}
                getRowId={getRowId}
            >
                <TreeDataState
                    // defaultExpandedRowIds={defaultExpandedRowIds}
                    expandedRowIds={expandedRowIds}
                    onExpandedRowIdsChange={setExpandedRowIds}
                />
                {/* <FilteringState
                    onFiltersChange={setFilters}
                /> */}
                <SummaryState
                    totalItems={totalSummaryItems}
                />
                <CustomSummary
                    totalValues={getTotalSummaryValues()}
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
                <SortingState
                    sorting={sorting}
                    onSortingChange={setSorting}
                    columnExtensions={sortingStateColumnExtensions}
                />
                <CustomTreeData
                    getChildRows={getChildRows}
                />
                <IntegratedFiltering />
                <IntegratedSorting />
                <PriceTypeProvider
                    for={["debit", "credit", "debit_balance", "credit_balance", "remaining_debit", "remaining_credit"]}
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
                <TableColumnVisibility
                    hiddenColumnNames={hiddenColumnNames}
                    onHiddenColumnNamesChange={setHiddenColumnNames}
                />
                {/* <TableFilterRow
                    cellComponent={FilterCell}
                    messages={tableMessages.TableFilterRow}
                /> */}
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
                <TableSummaryRow
                    messages={tableMessages.TableSummaryRow}
                />
                <TableSelection
                    selectByRowClick
                    highlightRow
                    showSelectionColumn={false}
                />
                <TableBandHeader
                    columnBands={columnBands}
                />
            </Grid>
        </Paper>
    );
};
