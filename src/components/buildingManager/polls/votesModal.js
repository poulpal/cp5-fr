import { Controller, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import {
  Button,
  Col,
  Form,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import Select from "react-select";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { useEffect } from "react";
import classnames from "classnames";
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

export default ({
  poll,
  show,
  toggle,
}) => {
  const currency = localStorage.getItem("currency");
  const [rows, setRows] = useState([]);
  const [columns] = useState([
    {
      name: 'no',
      title: '#',
      getCellValue: row => row.id
    },
    {
      name: 'option',
      title: 'گزینه',
      getCellValue: row => row.option
    },
    {
      name: 'unit',
      title: 'واحد',
      getCellValue: row => row.unit
    },
    {
      name: 'name',
      title: 'نام',
      getCellValue: row => row.user.name
    },
    {
      name: 'mobile',
      title: 'شماره موبایل',
      getCellValue: row => row.user.mobile
    },
    {
      name: 'تاریخ',
      title: 'تاریخ',
      getCellValue: row => moment(row.created_at).format(
        "jYYYY/jMM/jDD HH:mm"
      )
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [selection, setSelection] = useState([]);
  const [sorting, setSorting] = useState([]);
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
  ]);
  const [hiddenColumnNames, setHiddenColumnNames] = useState([
  ]);

  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");

  const refreshData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/building_manager/polls/${poll.id}`);
      setData(response.data);
      setRows(response.data.data.votes);
      setSelection([]);
      setData({
        ...data,
        total: response.data.data.transactions.length
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
  }, [poll]);


  return (
    <Modal isOpen={show} centered={true} size="lg" toggle={toggle}>
      <ModalHeader toggle={toggle}>رای ها</ModalHeader>
      <ModalBody>
        <Grid
          rows={rows}
          columns={columns}
        >
          <FilteringState
            onFiltersChange={setFilters}
          />
          <SummaryState
            totalItems={totalSummaryItems}
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
          <IntegratedFiltering />
          <IntegratedSorting />
          <PriceTypeProvider
            for={["price", "total_price"]}
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
          {/* <TableColumnVisibility
            hiddenColumnNames={hiddenColumnNames}
            onHiddenColumnNamesChange={setHiddenColumnNames}
          /> */}
          {/* <TableFilterRow
            cellComponent={FilterCell}
            messages={tableMessages.TableFilterRow}
          /> */}
          {/* <TableSummaryRow
            messages={tableMessages.TableSummaryRow}
          /> */}
          {/* <TableSelection
            selectByRowClick
            highlightRow
            showSelectionColumn={false}
          /> */}
        </Grid>
      </ModalBody>
    </Modal>
  );
};