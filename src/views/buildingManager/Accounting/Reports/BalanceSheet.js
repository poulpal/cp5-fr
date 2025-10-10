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
import { Alert, Col, Row } from 'reactstrap';
import PriceFormat from '../../../../components/PriceFormat';

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

    const [tableColumnExtensions] = useState([
        { columnName: 'no', align: 'center' },
    ]);
    const [defaultExpandedRowIds, setDefaultExpandedRowIds] = useState([]);

    const [page, setPage] = useState(0);
    const [perPage, setPerPage] = useState(20);
    const [rangeStart, setRangeStart] = useState("");
    const [rangeEnd, setRangeEnd] = useState("");

    const refreshData = async () => {
        setLoading(true);
        if (!rangeStart || !rangeEnd) return setLoading(false);
        try {
            const response = await axios.get(`/building_manager/accounting/reports/balanceSheet?start_date=${rangeStart}&end_date=${rangeEnd}`);
            setData(response.data.data);
            setRows([
                ...response.data.data.equity_accounts,
            ]);
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
    }, [rangeStart, rangeEnd]);

    return (
        <Paper style={{ borderRadius: "20px", minHeight: "89vh", marginBottom: "20px", paddingBottom: "5px" }}>
            <LoadingComponent loading={loading} />
            <h3 className="text-center mb-0 pt-1 pb-0">ترازنامه</h3>
            <div className="py-1 px-2 d-flex justify-content-between align-items-center">
                <div className='d-flex justify-content-between align-items-center'>
                    <DateRangeSelector setStart={setRangeStart} setEnd={setRangeEnd} accountingStyle={true} />
                </div>
                <div>
                    {/* <ExportToExcel
                        accountingStyle={true}
                        excelData={handleExcelData(rows, columns)}
                        fileName={"ProfitAndLoss_" + moment().format("jYYYY_jMM_jDD")}
                    /> */}
                </div>
            </div>
            <Row className='px-1'>
                <Col md={6} className='mb-2'>
                    <Alert color="success" className="d-flex justify-content-between align-items-center px-1 py-1">
                        <>
                            <h5>دارایی ها</h5>
                            <PriceFormat price={data.asset_total} showCurrency={false} />
                        </>
                    </Alert>
                    <Grid
                        rows={data.asset_accounts || []}
                        columns={columns}
                    >
                        <TreeDataState
                            defaultExpandedRowIds={defaultExpandedRowIds}
                        />
                        <CustomTreeData
                            getChildRows={getChildRows}
                        />
                        <PriceTypeProvider
                            for={["balance"]}
                        />
                        <Table
                            tableComponent={TableComponent}
                            cellComponent={props => Cell(props, page, perPage)}
                            messages={tableMessages.VirtualTable}
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
                    </Grid>
                </Col>
                <Col md={6} className='mb-2'>
                    <Alert color="danger" className="d-flex justify-content-between align-items-center px-1 py-1">
                        <>
                            <h5>بدهی ها + حقوق مالکانه</h5>
                            <PriceFormat price={data.asset_total} showCurrency={false} />
                        </>
                    </Alert>
                    <Grid
                        rows={data.liability_accounts || []}
                        columns={columns}
                    >
                        <TreeDataState
                            defaultExpandedRowIds={defaultExpandedRowIds}
                        />
                        <CustomTreeData
                            getChildRows={getChildRows}
                        />
                        <PriceTypeProvider
                            for={["balance"]}
                        />
                        <Table
                            tableComponent={TableComponent}
                            cellComponent={props => Cell(props, page, perPage)}
                            messages={tableMessages.VirtualTable}
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
                    </Grid>
                    <br />
                    <Grid
                        rows={data.equity_accounts || []}
                        columns={columns}
                    >
                        <TreeDataState
                            defaultExpandedRowIds={defaultExpandedRowIds}
                        />
                        <CustomTreeData
                            getChildRows={getChildRows}
                        />
                        <PriceTypeProvider
                            for={["balance"]}
                        />
                        <Table
                            tableComponent={TableComponent}
                            cellComponent={props => Cell(props, page, perPage)}
                            messages={tableMessages.VirtualTable}
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
                    </Grid>
                </Col>
            </Row>
        </Paper>
    );
};
