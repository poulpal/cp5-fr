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
import Unit from "../../components/user/Unit";
import NavbarComponent from "../../components/NavbarComponent";
import { truncateString } from "../../utility/Utils";

const Transactions = () => {
  const [unit, setUnit] = useState(null);
  const [data, setdata] = useState([]);
  const [loading, setLoading] = useState(false);

  const ismobile = false;

  const getInvoices = async () => {
    const selectedUnitId = localStorage.getItem("selectedUnit");
    setLoading(true);
    try {
      const response = await axios.get("/user/transactions");
      setdata(response.data.data.transactions);
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      }
      console.log(err);
    }
    setLoading(false);
  };

  const refreshData = () => {
    getInvoices();
  };

  useEffect(() => {
    refreshData();
    return () => {};
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
        return ((row.amount > 0) ? (
          <span className="text-dark" >
            <PriceFormat price={row.amount} convertToRial />
          </span>
        ) : (
          <span className="text-danger" >
          <PriceFormat price={-1 * row.amount} convertToRial />
            </span>
        ));
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
      {/* <NavbarComponent withImage={false} /> */}
      <LoadingComponent loading={loading} />
        <Row className="">
          <Col lg="12">
            <Card
              style={{
                minHeight: "90vh",
              }}
            >
              <div className="pt-2 pb-1">
                <h3 className="text-center mb-3">تراکنش ها</h3>
                <DataTable
                  title="تراکنش ها"
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
                          <span className="font-weight-bold">
                            شماره پیگیری:
                          </span>
                          <span className="ml-2">{data.trace_number}</span>
                        </div>
                      )}
                      <div className="">
                        <span className="font-weight-bold">واحد :</span>
                        <span className="ml-2">{data.unit?.unit_number}</span>
                      </div>
                      <div className="">
                        <span className="font-weight-bold">ساختمان :</span>
                        <span className="ml-2">{data.unit?.building.name}</span>
                      </div>
                      {data.attachments && data.attachments.length > 0 && (
                        <div className="">
                          <span className="font-weight-bold">
                            فایل های پیوست:
                          </span>
                          <br />
                          <span className="ml-2">
                            {data.attachments.map((attachment, index) => (
                              <a
                                href={attachment.file}
                                target="_blank"
                                className="mr-2"
                                key={index}
                              >
                                <img
                                  key={index}
                                  src={attachment.file}
                                  height="200"
                                />
                              </a>
                            ))}
                          </span>
                        </div>
                      )}
                      {ismobile && (
                        <>
                          <div className="">
                            <span className="font-weight-bold">
                              شیوه پرداخت:
                            </span>
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
          </Col>
        </Row>
    </div>
  );
};

export default Transactions;
