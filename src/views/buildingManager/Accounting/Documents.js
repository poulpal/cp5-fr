import React, { useEffect, useState } from 'react';
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { toast } from "react-hot-toast";
import LoadingComponent from '../../../components/LoadingComponent';
import { Modal, ModalHeader, UncontrolledTooltip } from 'reactstrap';
import { faEye } from '@fortawesome/free-regular-svg-icons';
import moment from "moment-jalaali";
import { useNavigate } from 'react-router';
import DateRangeSelector from '../../../components/DateRangeSelector';
import ExportToExcel from '../../../components/ExportToExcel';
import { PagingPanel } from '@devexpress/dx-react-grid-material-ui';

import Swal from "sweetalert2/dist/sweetalert2.all.js";
import withReactContent from "sweetalert2-react-content";
import "@styles/base/plugins/extensions/ext-component-sweet-alerts.scss";

import { TableComponent, PriceTypeProvider, FilterCell, Cell, handleExcelData, tableMessages, tableConfigs } from '@src/components/buildingManager/accounting/tables/tableComponents';
import ShowDocumentModal from './ShowDocumentModal';

export default () => {
    const MySwal = withReactContent(Swal);


    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [columns] = useState([
        {
            name: 'no',
            title: '#',
            getCellValue: row => row.id
        },
        {
            name: 'document_number',
            title: 'شماره سند',
            getCellValue: row => row.document_number
        },
        {
            name: 'created_at',
            title: 'تاریخ',
            getCellValue: row => moment(row.created_at).format(
                "jYYYY/jMM/jDD"
            )
        },
        {
            name: 'description',
            title: 'شرح',
            getCellValue: row => row.description
        },
        {
            name: 'amount',
            title: 'مبلغ',
            getCellValue: row => row.amount

        },
    ]);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [selection, setSelection] = useState([]);
    const [sorting, setSorting] = useState([{ columnName: 'created_at', direction: 'desc' }]);
    const [filters, setFilters] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);


    const [defaultColumnWidths] = useState([
        { columnName: 'no', width: 50 },
        { columnName: 'document_number', width: 150 },
        { columnName: 'created_at', width: 250 },
        { columnName: 'description', width: 550 },
        { columnName: 'amount', width: 250 },
    ]);
    const [tableColumnExtensions] = useState([
        { columnName: 'no', align: 'center' },
    ]);
    const [filteringStateColumnExtensions] = useState([
        { columnName: 'no', filteringEnabled: false },
    ]);
    const [sortingStateColumnExtensions] = useState([
        { columnName: 'no', sortingEnabled: false },
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
                `/building_manager/accounting/documents?paginate=1&page=${page + 1}&perPage=${perPage == 0 ? data.total || 100000 : perPage}&sort=${sorting[0].columnName}&order=${sorting[0].direction}&start_date=${rangeStart}&end_date=${rangeEnd}&filters=${JSON.stringify(filters)}`
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

    const handleDoubleClick = (row) => {
        setSelectedDocument(row);
        setShowModal(true);
        // navigate('/buildingManager/documents/' + row.document_number);
    }

    return (
        <Paper style={{ borderRadius: "20px", minHeight: "89vh", marginBottom: "20px", paddingBottom: "5px" }}>
            <LoadingComponent loading={loading} />
            {selectedDocument && (
                <Modal isOpen={showModal} toggle={() => setShowModal(!showModal)} size="xl">
                    <ModalHeader toggle={() => setShowModal(!showModal)}>سند {selectedDocument.document_number}</ModalHeader>

                    <ShowDocumentModal number={selectedDocument.document_number} />
                </Modal>
            )}
            <h3 className="text-center mb-0 pt-1 pb-0">اسناد حسابداری</h3>
            <div className="py-1 px-2 d-flex justify-content-between align-items-center">
                <div>
                    <DateRangeSelector setStart={setRangeStart} setEnd={setRangeEnd} accountingStyle={true} />
                </div>
                <div>
                    <FontAwesomeIcon icon={faPlus} size="lg" color="green" className="clickable" id='add-icon' onClick={() => {
                        navigate('/buildingManager/addDocument');
                    }} />
                    <UncontrolledTooltip placement="bottom" target="add-icon">
                        افزودن سند
                    </UncontrolledTooltip>
                    {rows[selection[0]] ? (
                        <>
                            <FontAwesomeIcon icon={faEye} size="lg" color="blue" id="eye-icon" className="clickable" onClick={() => {
                                navigate('/buildingManager/documents/' + rows[selection[0]].document_number);
                            }} />
                        </>
                    ) : (<>
                        <FontAwesomeIcon icon={faEye} size="lg" color="grey" id="eye-icon" className="clickable disabled" />
                    </>)}
                    <UncontrolledTooltip placement="bottom" target="eye-icon">
                        مشاهده سند
                    </UncontrolledTooltip>
                    {rows[selection[0]] ? (
                        <>
                            <FontAwesomeIcon icon={faTrash} size="lg" color="red" id="trash-icon" className="clickable" onClick={() => {
                                MySwal.fire({
                                    title: "آیا از حذف این سند اطمینان دارید؟",
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
                                            .delete(
                                                "/building_manager/accounting/documents/" +
                                                rows[selection[0]].document_number
                                            )
                                            .then((response) => {
                                                toast.success(
                                                    response.data.message
                                                );
                                                refreshData();
                                            })
                                            .catch((err) => {
                                                if (
                                                    err.response &&
                                                    err.response.data.message
                                                ) {
                                                    toast.error(
                                                        err.response.data.message
                                                    );
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
                        <FontAwesomeIcon icon={faTrash} size="lg" color="grey" id="trash-icon" className="clickable disabled" />
                    </>)}
                    <UncontrolledTooltip placement="bottom" target="trash-icon">
                        حذف سند
                    </UncontrolledTooltip>
                    <ExportToExcel
                        accountingStyle={true}
                        excelData={handleExcelData(rows, columns)}
                        fileName={"Documents_" + moment().format("jYYYY_jMM_jDD")}
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
                    for={["debit", "credit", "amount"]}
                />
                <VirtualTable
                    tableComponent={TableComponent}
                    cellComponent={props => Cell(props, page, perPage, handleDoubleClick)}
                    columnExtensions={tableColumnExtensions}
                    messages={tableMessages.VirtualTable}
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
