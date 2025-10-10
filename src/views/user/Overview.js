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
import Unit from "../../components/user/Unit";
import Wallet from "./Wallet";
import { isNative, NativeAppVersion, truncateString } from "../../utility/Utils";
import { Link } from "react-router-dom";
import { userNavigation } from "../../navigation/vertical";

// import Banner from "../../assets/images/banner.jpg";

const Overview = () => {
  const [unit, setUnit] = useState(null);
  const [data, setdata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [versionInfo, setVersionInfo] = useState(null);

  const ismobile = false;

  const getSelectedUnit = async () => {
    const selectedUnitId = localStorage.getItem("selectedUnit");
    if (!selectedUnitId) return;
    setLoading(true);
    try {
      const response = await axios.get("/user/units/" + selectedUnitId);
      setUnit(response.data.data.unit);
    } catch (error) {
      console.log(error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      }
    }
    setLoading(false);
  };

  const getVersionInfo = async () => {
    try {
      const response = await axios.get("public/version");
      setVersionInfo(response.data);
    } catch (error) {
      console.log(error);
    }
  };


  const getInvoices = async () => {
    const selectedUnitId = localStorage.getItem("selectedUnit");
    setLoading(true);
    try {
      const response = await axios.get("/user/invoices?unit=" + selectedUnitId);
      setdata(response.data.data.invoices);
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      }
      console.log(err);
    }
    setLoading(false);
  };

  const refreshData = () => {
    getSelectedUnit();
    getInvoices();
    getVersionInfo();
  };

  useEffect(() => {
    refreshData();
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
      {
        name: "وضعیت",
        selector: (row) => row.is_verified,
        sortable: true,
        cell: (row) => (
          <>
            <Badge color={row.is_verified ? "success" : "dark"}>
              {row.is_verified ? "تایید شده" : "در انتظار تایید"}
            </Badge>
          </>
        ),
      },
    ]);
  }

  return (
    <div>
      <LoadingComponent loading={loading} />
      {/* {import.meta.env.VITE_APP_TYPE == 'main' && (
        <Row className="mb-2">
          <Col md={6} className="m-auto">
            <Link to={import.meta.env.VITE_LANDING_URL} className="">
              <img src={Banner} className="img-fluid" />
            </Link>
          </Col>
        </Row>
      )} */}
      {versionInfo?.version && isNative() && (NativeAppVersion() !== versionInfo.version) && (
        <Card className="mb-2" style={{
          backgroundColor: '#eed202',
        }}>
          <CardLink href="">
            <CardBody>
              <p className="text-center" style={{
                color: '#000',
                marginBottom: 0,
              }}>
                شما از آخرین نسخه نرم افزار استفاده نمی کنید. لطفا برای بهره مندی از امکانات جدید نرم افزار خود را به آخرین نسخه بروزرسانی کنید.
              </p>
              <Button color="primary" className="w-100 mt-2 mb-1" onClick={
                () => {
                  window.open(versionInfo.urls.cafebazaar, "_blank");
                }
              }>بروزرسانی</Button>
            </CardBody>
          </CardLink>
        </Card>
      )}
      <Wallet showTransactions={false} />
      {unit && (
        <Row>
          <Col lg="12">
            <Unit unit={unit} refreshData={refreshData} />
          </Col>
          <Col lg="12">
            <Card
              style={{
                minHeight: "90vh",
              }}
            >
              <div className="pt-2 pb-1">
                <h3 className="text-center mb-3">صورتحساب ها</h3>
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
                          <div className="">
                            <span className="font-weight-bold">وضعیت:</span>
                            <span className="ml-2">
                              <Badge
                                color={data.is_verified ? "success" : "warning"}
                              >
                                {data.is_verified
                                  ? "تایید شده"
                                  : "در انتظار تایید"}
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
      )}
    </div>
  );
};

export default Overview;
