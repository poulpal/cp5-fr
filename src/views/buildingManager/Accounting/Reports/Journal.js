import React, { useEffect, useRef, useState } from 'react';
import Paper from '@mui/material/Paper';
import {
    SelectionState,
    FilteringState,
    SortingState,
    PagingState,
    CustomPaging,
} from '@devexpress/dx-react-grid';
import {
    Grid,
    TableColumnResizing,
    TableFilterRow,
    TableHeaderRow,
    TableSelection,
    VirtualTable,
} from '@devexpress/dx-react-grid-bootstrap4';
import '@devexpress/dx-react-grid-bootstrap4/dist/dx-react-grid-bootstrap4.css';
import axios from "axios";
import { toast } from "react-hot-toast";
import LoadingComponent from '../../../../components/LoadingComponent';
import moment from "moment-jalaali";
import { useNavigate } from 'react-router';
import ExportToExcel from '../../../../components/ExportToExcel';
import DateRangeSelector from '../../../../components/DateRangeSelector';
import { PagingPanel } from '@devexpress/dx-react-grid-material-ui';
import { TableComponent, PriceTypeProvider, FilterCell, Cell, handleExcelData, tableMessages, tableConfigs } from '@src/components/buildingManager/accounting/tables/tableComponents';

export default () => {
    const tableRef = useRef();
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [columns] = useState([
        {
            name: 'no',
            title: '#',
            getCellValue: row => row.id
        },
        {
            name: 'created_at',
            title: 'تاریخ',
            getCellValue: row => moment(row.created_at).format(
                "jYYYY/jMM/jDD"
            )
        },
        {
            name: 'document_number',
            title: 'شماره سند',
            getCellValue: row => row.document.document_number
        },
        {
            name: 'account',
            title: 'حساب',
            getCellValue: row => row.account.parent ? row.account.parent.name + " > " + row.account.name : row.account.name
        },
        {
            name: 'detail',
            title: 'تفصیل',
            getCellValue: row => row.detail?.name
        },
        {
            name: 'description',
            title: 'شرح',
            getCellValue: row => row.description
        },
        {
            name: 'debit',
            title: 'بدهکار',
            getCellValue: row => row.debit
        },
        {
            name: 'credit',
            title: 'بستانکار',
            getCellValue: row => row.credit
        },
    ]);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [selection, setSelection] = useState([]);
    const [sorting, setSorting] = useState([{ columnName: 'created_at', direction: 'asc' }]);
    const [filters, setFilters] = useState([]);


    const [defaultColumnWidths] = useState([
        { columnName: 'no', width: 50 },
        { columnName: 'created_at', width: 120 },
        { columnName: 'document_number', width: 80 },
        { columnName: 'account', width: 300 },
        { columnName: 'detail', width: 250 },
        { columnName: 'description', width: 400 },
        { columnName: 'debit', width: 150 },
        { columnName: 'credit', width: 150 },
    ]);
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

    const [page, setPage] = useState(0);
    const [perPage, setPerPage] = useState(20);
    const [rangeStart, setRangeStart] = useState("");
    const [rangeEnd, setRangeEnd] = useState("");

    useEffect(() => {
        refreshData();
    }, [page, perPage, sorting, filters]);
    useEffect(() => {
        setPage(0);
        refreshData();
    }, [rangeStart, rangeEnd]);

    const refreshData = async () => {
        setLoading(true);
        if (!rangeStart || !rangeEnd) {
            setLoading(false);
            return;
        }
        try {
            const response = await axios.get(
                `/building_manager/accounting/reports/journal?paginate=1&page=${page + 1}&perPage=${perPage == 0 ? data.total || 100000 : perPage}&sort=${sorting[0].columnName}&order=${sorting[0].direction}&start_date=${rangeStart}&end_date=${rangeEnd}&filters=${JSON.stringify(filters)}`
            );
            setData(response.data);
            setRows(response.data.data);
            setSelection([]);
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
            <h3 className="text-center mb-0 pt-1 pb-0">دفتر روزنامه</h3>
            <div className="py-1 px-2 d-flex justify-content-between align-items-center">
                <div>
                    <DateRangeSelector setStart={setRangeStart} setEnd={setRangeEnd} accountingStyle={true} />
                </div>
                <div>
                    <ExportToExcel
                        accountingStyle={true}
                        excelData={handleExcelData(rows, columns)}
                        fileName={"Journal_" + moment().format("jYYYY_jMM_jDD")}
                    />
                </div>
            </div>
            <Grid
                rows={rows}
                columns={columns}
            >
                <FilteringState
                    onFiltersChange={setFilters}
                    columnExtensions={filteringStateColumnExtensions}
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
                <PagingState
                    currentPage={page}
                    onCurrentPageChange={setPage}
                    pageSize={perPage}
                    onPageSizeChange={setPerPage}
                />
                <CustomPaging
                    totalCount={data.total || 0}
                />
                <PriceTypeProvider
                    for={["debit", "credit"]}
                />
                <VirtualTable
                    tableComponent={TableComponent}
                    cellComponent={props => Cell(props, page, perPage)}
                    columnExtensions={tableColumnExtensions}
                    messages={tableMessages.VirtualTable}
                    ref={tableRef}
                />
                <TableColumnResizing defaultColumnWidths={defaultColumnWidths} resizingMode={tableConfigs.resizingMode} />
                <TableHeaderRow showSortingControls />
                <PagingPanel
                    pageSizes={tableConfigs.pageSizes}
                    messages={{ ...tableMessages.PagingPanel, info: `صفحه ${page + 1} از ${Math.ceil(data.total / perPage)} (${data.total} مورد)`, }}
                />
                <TableFilterRow
                    cellComponent={FilterCell}
                    messages={tableMessages.TableFilterRow}
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
