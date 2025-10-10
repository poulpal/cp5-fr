import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardText,
  CardLink,
  Row,
  Col,
  Badge,
  CardFooter,
  Button,
} from "reactstrap";
import DataTable from "react-data-table-component";
import { toast } from "react-hot-toast";
import { useState } from "react";
import LoadingComponent from "../../components/LoadingComponent";
import { useEffect } from "react";
import axios from "axios";
import moment from "moment-jalaali";
import { useMediaQuery } from "react-responsive";
import tableConfig from "../../configs/tableConfig";
import PriceFormat from "../../components/PriceFormat";
import AddBalanceModal from "../../components/user/AddBalanceModal";
import { truncateString } from "../../utility/Utils";

const Wallet = ({ showTransactions = true }) => {
  const [unit, setUnit] = useState(null);
  const [data, setdata] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [addBalanceModal, setAddBalanceModal] = useState(false);

  const ismobile = false;

  const getInvoices = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/user/wallet/transactions");
      setdata(response.data.data.transactions);
      setBalance(response.data.data.balance);
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      }
      console.log(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    getInvoices();
    return () => { };
  }, []);

  let columns = [
    {
      name: "#",
      selector: (row) => row.id,
      sortable: true,
    },
    {
      name: "تاریخ",
      selector: (row) => row.created_at,
      sortable: true,
      cell: (row) => moment(row.created_at).format("HH:mm jYYYY/jMM/jDD"),
    },
    {
      name: "مبلغ",
      selector: (row) => row.amount,
      cell: (row) => {
        return row.amount > 0 ? (
          <span className="text-dark">
            <PriceFormat price={row.amount} convertToRial/>
          </span>
        ) : (
          <span className="text-danger">
            <PriceFormat price={-1 * row.amount} convertToRial />
          </span>
        );
      },
      sortable: true,
    },
  ];

  if (!ismobile) {
    columns = columns.concat([
      {
        name: "شرح",
        selector: (row) => row.description,
        cell: (row) => <div className="text-warp">{truncateString(row.description, 50)}</div>,
      },
      {
        name: "شیوه پرداخت",
        selector: (row) => row.payment_method,
        cell: (row) => (
          <Badge
            color={row.payment_method === "پرداخت آنلاین" ? "dark" : "dark"}
          >
            {row.payment_method}
          </Badge>
        ),
      },
    ]);
  }

  return (
    <div>
      <LoadingComponent loading={loading} />
      <AddBalanceModal
        addBalanceModal={addBalanceModal}
        toggleAddBalanceModal={() => {
          setAddBalanceModal(!addBalanceModal);
        }}
        setLoading={setLoading}
      />
      <Row>
        <Col lg="12">
          <Card className="text-center">
            <CardHeader>
              <h3 className="text-center w-100">کیف پول</h3>
            </CardHeader>
            <CardBody>
              <h6 className="d-flex flex-row justify-content-between">
                <span className="font-weight-bold">موجودی : </span>
                <PriceFormat price={balance} decimalScale={1} convertToRial/>
              </h6>
            </CardBody>
            <CardFooter>
              <Row>
                <Col md="3"></Col>
                <Col md="6">
                  <Button
                    color="success"
                    className="w-100 mb-1"
                    onClick={() => {
                      setAddBalanceModal(true);
                    }}
                  >
                    افزایش موجودی
                  </Button>
                </Col>
              </Row>
            </CardFooter>
          </Card>
        </Col>
        {showTransactions && (<Col lg="12">
          <Card
            style={{
              minHeight: "90vh",
            }}
          >
            <div className="pt-2 pb-1">
              <h3 className="text-center mb-3">تراکنش ها</h3>
              <DataTable
                title="صورتحساب ها"
                columns={columns}
                data={data}
                {...tableConfig}
                expandableRows
                expandableRowsComponent={({ data }) => (
                  <div className="px-2 py-1">
                    <div className="">
                      <span className="font-weight-bold">شرح :</span>
                      <span className="ml-2">{data.description}</span>
                    </div>
                    {data.payment_method === "پرداخت آنلاین" && (
                      <div className="">
                        <span className="font-weight-bold">شماره پیگیری:</span>
                        <span className="ml-2">{data.trace_number}</span>
                      </div>
                    )}
                    {ismobile && (
                      <>
                        <div className="">
                          <span className="font-weight-bold">شیوه پرداخت:</span>
                          <span className="ml-2">
                            <Badge
                              color={
                                data.payment_method === "پرداخت آنلاین"
                                  ? "dark"
                                  : "dark"
                              }
                            >
                              {data.payment_method}
                            </Badge>
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              />
            </div>
          </Card>
        </Col>)}
      </Row>
    </div>
  );
};

export default Wallet;
