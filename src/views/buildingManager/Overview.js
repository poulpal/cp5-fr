import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardText,
  CardLink,
  Row,
  Col,
  CardFooter,
  Button,
} from "reactstrap";
import axios from "axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

import LoadingComponent from "../../components/LoadingComponent";
import PriceFormat from "../../components/PriceFormat";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQrcode } from "@fortawesome/free-solid-svg-icons";
import ChartCard from "../../components/buildingManager/stats/chartCard";
import SignContract from "../../components/buildingManager/signContract";
import moment from "moment-jalaali";
import { isNative, NativeAppVersion } from "../../utility/Utils";
import PopUp from "../../components/PopUp";



const Overview = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [versionInfo, setVersionInfo] = useState(null);

  const getStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/building_manager/stats");
      setStats({
        ...response.data.data,
      });
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      }
      console.log(err);
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

  useEffect(() => {
    getStats();
    getVersionInfo();
    setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => { };
  }, []);

  const currency = localStorage.getItem("currency");

  return (
    <>
      <LoadingComponent loading={loading} />
      {stats && (
        <>
          {stats.popup && stats.popup.text && (
            <PopUp popup={stats.popup} />
          )}
          {stats.banner && stats.banner.text && (
            <Card className="mb-2" style={{
              backgroundColor: '#eed202',
            }}>
              {stats.banner.cta && stats.banner.cta_text ? (
                <CardLink href={stats.banner.cta}>
                  <CardBody>
                    <p className="text-center" style={{
                      color: '#000',
                      marginBottom: 0,
                    }}>
                      {stats.banner.text}
                    </p>
                  </CardBody>
                </CardLink>
              ) : (
                <CardBody>
                  <p className="text-center" style={{
                    color: '#000'
                  }}>
                    {stats.banner.text}
                  </p>
                </CardBody>
              )}

              {stats.banner.cta && stats.banner.cta_text && (
                <CardFooter style={{ textAlign: 'left', paddingTop: '8px', paddingBottom: '8px' }}>
                  <CardLink href={stats.banner.cta} style={{
                    color: 'green'
                  }}>
                    {stats.banner.cta_text}
                  </CardLink>
                </CardFooter>
              )}
            </Card>
          )}
          {!stats.signed_contract && (
            <SignContract setLoading={setLoading} stats={stats} />
          )}
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
          <Row>
            <Col md="6">
              <Card className="pt-1 pb-1">
                <CardHeader className="border-bottom">
                  <h4>اطلاعات حساب</h4>
                  <span>
                    {moment(currentTime).format("HH:mm jYYYY/jMM/jDD")}
                  </span>
                </CardHeader>
                <CardBody className="pt-2">
                  <div className="d-flex justify-content-between mb-1">
                    <strong>موجودی صندوق</strong>
                    <strong className="text-dark">
                      <PriceFormat convertToRial={currency === 'rial'} price={stats.balance} />
                    </strong>
                  </div>
                  {stats.balances.map((balance, index) => (
                    <div className="d-flex justify-content-between mb-1" key={index}>
                      <span>{balance.title}</span>
                      <span className="text-dark">
                        <PriceFormat convertToRial={currency === 'rial'} price={balance.amount} />
                      </span>
                    </div>
                  ))}
                  <div className="d-flex justify-content-between">
                    <span>طلب از واحد ها</span>
                    <span className="text-danger">
                      <PriceFormat convertToRial={currency === 'rial'} price={stats.units_with_debt_sum} />
                    </span>
                  </div>
                </CardBody>
              </Card>
              <Card className="pt-1 pb-0">
                <CardHeader className="border-bottom d-flex justify-content-between">
                  <h5>واحد های بدهکار ({stats?.units_with_debt?.length})</h5>
                  <h5>بدهی کلی</h5>
                </CardHeader>
                <CardBody
                  className="pt-1"
                  style={{
                    maxHeight: "200px",
                    overflowY: "auto",
                  }}
                >
                  {stats?.units_with_debt?.map((unit, index) => (
                    <>
                      <div className="d-flex justify-content-between mb-1" key={index}>
                        <span>{index + 1} - واحد {unit.unit_number}</span>
                        <span className="text-danger">
                          <PriceFormat convertToRial={currency === 'rial'} price={unit.charge_debt} />
                        </span>
                      </div>
                    </>
                  ))}
                </CardBody>
              </Card>
              <Card className="pt-1 pb-0">
                <CardHeader className="border-bottom d-flex justify-content-between">
                  <h5>واحد های بستانکار ({stats?.units_with_deposit?.length})</h5>
                  <h5>دریافتی</h5>
                </CardHeader>
                <CardBody
                  className="pt-1"
                  style={{
                    maxHeight: "200px",
                    overflowY: "auto",
                  }}
                >
                  {stats?.units_with_deposit?.map((unit, index) => (
                    <>
                      <div className="d-flex justify-content-between mb-1" key={index}>
                        <span>{index + 1} - واحد {unit.unit_number}</span>
                        <span className="text-dark">
                          <PriceFormat convertToRial={currency === 'rial'} price={-1 * unit.charge_debt} />
                        </span>
                      </div>
                    </>
                  ))}
                </CardBody>
              </Card>
            </Col>
            <Col md="6">
              <ChartCard stats={stats} />
              <Card className="pt-1 pb-0">
                <CardHeader className="border-bottom d-flex justify-content-between">
                  <h5>واحد های بدون بدهی ({stats?.units_with_zero_debt?.length})</h5>
                </CardHeader>
                <CardBody
                  className="pt-1"
                  style={{
                    maxHeight: "200px",
                    overflowY: "auto",
                  }}
                >
                  {stats?.units_with_zero_debt?.map((unit, index) => (
                    <>
                      <div className="d-flex justify-content-between mb-1" key={index}>
                        <span>{index + 1} - واحد {unit.unit_number}</span>
                        {/* <span className="text-danger">
                          <PriceFormat convertToRial={currency === 'rial'} price={unit.charge_debt} />
                        </span> */}
                      </div>
                    </>
                  ))}
                </CardBody>
              </Card>
            </Col>
          </Row>
          {/* <Row>
            <Col md="6" className="m-auto">
              <a href="#" onClick={handleGetQrcodes} className="text-dark">
                <div className="d-flex flex-column justify-content-center mb-1">
                  <h5 className="text-center">دریافت QR کد</h5>
                  <FontAwesomeIcon icon={faQrcode} className="mr-2" size="5x" />
                </div>
              </a>
            </Col>
          </Row> */}
        </>
      )}
    </>
  );
};

export default Overview;
