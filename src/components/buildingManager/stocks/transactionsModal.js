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
  stock,
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
      name: 'import',
      title: 'ورود',
      getCellValue: row => row.quantity > 0 ? row.quantity : 0
    },
    {
      name: 'export',
      title: 'خروج',
      getCellValue: row => row.quantity < 0 ? -1 * row.quantity : 0
    },
    {
      name: 'balance',
      title: 'تراز',
      getCellValue: row => row.balance
    },
    {
      name: 'total_price',
      title: 'مبلغ',
      getCellValue: row => row.price * Math.abs(row.quantity) * (currency === "rial" ? 10 : 1)
    },
    {
      name: 'price',
      title: 'مبلغ واحد',
      getCellValue: row => row.price * (currency === "rial" ? 10 : 1)
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
      const response = await axios.get(`/building_manager/stocks/${stock.id}`);
      setData(response.data);
      setRows(response.data.data.transactions);
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
  }, [stock]);


  return (
    <Modal isOpen={show} centered={true} size="xl" toggle={toggle}>
      <ModalHeader toggle={toggle}>تراکنش های کالا</ModalHeader>
      <ModalBody>
        <div className="py-1 px-2 d-flex justify-content-between align-items-center">
          <div className='d-flex justify-content-between align-items-center'>
          </div>
          <div>
            <ExportToExcel
              accountingStyle={true}
              excelData={handleExcelData(rows, columns.filter(c => c.name !== 'no'))}
              fileName={"StockTransactions_" + moment().format("jYYYY_jMM_jDD")}
            />
          </div>
        </div>
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
          <TableColumnVisibility
            hiddenColumnNames={hiddenColumnNames}
            onHiddenColumnNamesChange={setHiddenColumnNames}
          />
          <TableFilterRow
            cellComponent={FilterCell}
            messages={tableMessages.TableFilterRow}
          />
          <TableSummaryRow
            messages={tableMessages.TableSummaryRow}
          />
          <TableSelection
            selectByRowClick
            highlightRow
            showSelectionColumn={false}
          />
        </Grid>
      </ModalBody>
    </Modal>
  );
};