import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Card, Col, Row } from "reactstrap";
import LoadingComponent from "../../components/LoadingComponent";
import Avatar from "@components/avatar";
import PriceFormat from "../../components/PriceFormat";
import CopyToClipboard from "react-copy-to-clipboard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import CopyIcon from "@src/assets/images/icons/copy.svg";
import themeConfig from "@configs/themeConfig";

const MyUnit = () => {
  const [unit, setUnit] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    getSelectedUnit();
    const user = localStorage.getItem("userData");
    setUser(JSON.parse(user));
    return () => {};
  }, []);

  return (
    <>
      <LoadingComponent loading={loading} />
      {unit && (
        <Row>
          <Col md="12 px-3">
            <Card
              className="px-3 pt-4 pb-1 mt-4"
              style={{
                background: themeConfig.layout.primaryColor,
                borderRadius: "20px",
                boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
              }}
            >
              <Avatar
                img={unit.building.image}
                imgHeight="100"
                imgWidth="100"
                style={{
                  width: "100px",
                  height: "100px",
                  position: "absolute",
                  top: "-60px",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              />
              <span className="text-center text-white">
                واحد {unit.unit_number}
              </span>
              <span className="text-center text-white">
                {user.first_name} {user.last_name}
              </span>
            </Card>
            <Card
              style={{
                borderRadius: "20px",
                boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
              }}
            >
              <div className="d-flex justify-content-between px-3 py-2">
                <span>مبلغ شارژ</span>
                <span>
                  <PriceFormat price={unit.charge_fee} convertToRial />
                </span>
              </div>
            </Card>
            <Card
              style={{
                borderRadius: "20px",
                boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
              }}
            >
              <div className="d-flex justify-content-between px-3 py-2">
                <span>شماره موبایل</span>
                <span>{user.mobile}</span>
              </div>
            </Card>
            <Card
              style={{
                borderRadius: "20px",
                boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
              }}
            >
              <div className="d-flex justify-content-between px-3 py-2">
                <span>لینک پرداخت</span>
                <span>
                  <a href={`${import.meta.env.VITE_LANDING_URL}/b${unit.token}`}>
                    {`${import.meta.env.VITE_LANDING_URL}/b${unit.token}`}
                  </a>
                  <CopyToClipboard
                    text={`${import.meta.env.VITE_LANDING_URL}/b${unit.token}`}
                    onCopy={() => toast.success("لینک کپی شد")}
                    style={{
                      cursor: "pointer",
                      marginRight: "10px",
                    }}
                  >
                    <img
                      src={CopyIcon}
                      alt="copy"
                      style={{
                        width: "20px",
                        height: "20px",
                        
                      }}
                    />

                  </CopyToClipboard>
                </span>
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

export default MyUnit;
