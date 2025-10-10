import LoadingComponent from "@src/components/LoadingComponent";
import FloatingAddButton from "@src/components/FloatingAddButton";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useEffect } from "react";
import { Badge, Card, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import DataTable from "react-data-table-component";
import moment from "moment-jalaali";
import tableConfig from "../../configs/tableConfig";
import PriceFormat from "../../components/PriceFormat";
import DepositRequestModal from "../../components/buildingManager/DepositRequestModal";
import ExportToExcel from "../../components/ExportToExcel";
import { isNative, truncateString } from "../../utility/Utils";
import { omit } from "lodash";
import apiConfig from "../../configs/apiConfig";

const DepositRequests = () => {
  const [loading, setLoading] = useState(false);
  const [depositRequestModal, setDepositRequestModal] = useState(false);
  const [data, setData] = useState([]);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [sort, setSort] = useState("created_at");
  const [order, setOrder] = useState("desc");

  const isMultiBalance = JSON.parse(localStorage.getItem("buildingOptions")).multi_balance;

  const refreshData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/building_manager/depositRequests?paginate=1&page=${page}&perPage=${perPage}&sort=${sort}&order=${order}`
      );
      setData(response.data);
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
      name: "تاریخ",
      selector: (row) => row.created_at,
      sortable: true,
      cell: (row) => moment(row.created_at).format("jYYYY/jMM/jDD"),
      sortField: "created_at",
    },
    {
      name: "صندوق",
      selector: (row) => row.balance?.title,
      sortable: false,
      sortField: "amount",
      omit: !isMultiBalance || isNative(),
    },
    {
      name: "مبلغ",
      selector: (row) => row.amount,
      sortable: true,
      cell: (row) => <PriceFormat price={row.amount} convertToRial={currency === 'rial'} />,
      sortField: "amount",
    },
    {
      name: "وضعیت",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => {
        const color =
          row.status === "در انتظار تایید"
            ? "warning"
            : row.status === "رد شده"
              ? "danger"
              : "success";
        return <Badge color={color}>{row.status}</Badge>;
      },
      sortField: "status",
    },
    {
      name: "واریز به حساب",
      selector: (row) => row.deposit_to,
      sortable: true,
      cell: (row) => {
        return (
          <>
            {row.deposit_to === "me" && (
              <Badge color={row.deposit_to === "me" ? "success" : "info"}>
                {row.deposit_to === "me" ? "خودم" : "شماره شبا :"}
              </Badge>
            )}
            {row.deposit_to === "me" ? "" : row.sheba}
          </>
        );
      },
      sortField: "deposit_to",
      omit: isNative(),
    },
    {
      name: "توضیحات",
      selector: (row) => row.description,
      cell: (row) => <div className="text-warp">{truncateString(row.description, 50)}</div>,
      sortable: true,
      sortField: "description",
      omit
    },
  ];

  const handleExcelData = () => {
    const excelData = [];
    data.data?.forEach((item) => {
      excelData.push({
        "تاریخ": moment(item.created_at).format("jYYYY/jMM/jDD"),
        "مبلغ درخواستی": item.amount * 10,
        وضعیت: item.status,
        "واریز به حساب": item.deposit_to === "me" ? "خودم" : item.sheba,
        توضیحات: item.description,
      });
    });
    return excelData;
  };

  const handleGetPdf = async (name) => {
    if (isNative() && window.ReactNativeWebView){
      window.ReactNativeWebView.postMessage(JSON.stringify({
        action: "downloadPdf",
        type: "pdf",
        name: name,
        url: `/building_manager/depositRequests/pdf?paginate=1&page=${page}&perPage=${perPage}&sort=${sort}&order=${order}`,
        token: localStorage.getItem("accessToken"),
        baseUrl: apiConfig.baseUrl,
        method: "GET",
      }));
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`/building_manager/depositRequests/pdf?paginate=1&page=${page}&perPage=${perPage}&sort=${sort}&order=${order}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", name + ".zip");
      link.click();
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      }
    }
    setLoading(false);
  };

  return (
    <>
      <LoadingComponent loading={loading} />
      <DepositRequestModal
        show={depositRequestModal}
        setShow={setDepositRequestModal}
        setLoading={setLoading}
        refreshData={refreshData}
      />
      <Card
        style={{
          minHeight: "89vh",
        }}
      >
        <div className="pb-5 pt-2">
          <h3 className="text-center mb-1">واریزی ها</h3>
          <FloatingAddButton
            onClick={() => setDepositRequestModal(true)}
            text="درخواست واریز جدید"
          />
          <div
            style={{
              float: "left",
              marginLeft: "20px",
            }}
          >
            <UncontrolledDropdown
              className="me-1"
              direction="down"
            >
              <DropdownToggle
                caret
                color="success"
              >
                خروجی
              </DropdownToggle>
              <DropdownMenu>
                <ExportToExcel
                  dropDown={true}
                  excelData={handleExcelData()}
                  fileName={"DepositRequests_" + moment().format("jYYYY_jMM_jDD")}
                />
                <DropdownItem onClick={() => {
                  handleGetPdf("DepositRequests_" + moment().format("jYYYY_jMM_jDD"));
                }}>
                  خروجی PDF
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </div>
          <DataTable
            title="درخواست های واریز"
            columns={columns}
            data={data.data}
            {...tableConfig}
            paginationServer={true}
            paginationTotalRows={data.total}
            onChangePage={(page) => setPage(page)}
            onChangeRowsPerPage={(perPage) => setPerPage(perPage)}
            sortServer
            onSort={(column, direction) => {
              setSort(column.sortField);
              setOrder(direction);
            }}
            expandableRows
            expandableRowsComponent={({ data }) => (
              <div className="px-2 py-1">
                {isMultiBalance && (
                  <div className="">
                    <span className="font-weight-bold">صندوق :</span>
                    <span className="ml-2">{data.balance?.title}</span>
                  </div>
                )}
                <div className="">
                  <span className="font-weight-bold">مبلغ :</span>
                  <span className="ml-2">
                    <PriceFormat price={data.amount} convertToRial={currency === 'rial'} />
                  </span>
                </div>
                <div className="">
                  <span className="font-weight-bold">شرح :</span>
                  <span className="ml-2">{data.description}</span>
                </div>
                <div className="">
                  <span className="font-weight-bold">واریز به :</span>
                  <span className="ml-2">
                    {data.deposit_to === "me" ? "" : data.sheba}
                  </span>
                </div>
              </div>
            )}
          />
        </div>
      </Card>
    </>
  );
};

export default DepositRequests;
