// ** React Imports
import { Link, useNavigate } from "react-router-dom";

// ** Custom Components
import Avatar from "@components/avatar";

// ** Third Party Components
import { List, Power, User, Lock } from "react-feather";
import {
  UncontrolledDropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem,
  Card,
  CardBody,
} from "reactstrap";
import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useMediaQuery } from "react-responsive";
import ChangePasswordModal from "../../../../components/ChangePasswordModal";
import LoadingComponent from "../../../../components/LoadingComponent";
import themeConfig from "@configs/themeConfig";

const style = {
  color: "#fff",
  hover: {
    color: "#fff",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
};

const UserDropdown = () => {
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [changePasswordModal, setChangePasswordModal] = useState(false);

  const navigate = useNavigate();

  const getSelectedUnit = async () => {
    const selectedUnitId = localStorage.getItem("selectedUnit");
    if (!selectedUnitId) return;
    if (selectedUnitId === "buildingManager") {
      try {
        const response = await axios.get("/building_manager/profile");
        setSelectedUnit({
          id: "buildingManager",
          unit_number: "مدیر ساختمان",
          building: {
            name: response.data.data.building.name,
            image: response.data.data.building.image,
          },
        });
      } catch (error) {
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        }
      }
      return;
    }
    try {
      const response = await axios.get("/user/units/" + selectedUnitId);
      setSelectedUnit(response.data.data.unit);
    } catch (error) {
      console.log(error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      }
    }
  };

  useEffect(() => {
    getSelectedUnit();
    setUser(JSON.parse(localStorage.getItem("userData")));

    return () => {};
  }, []);

  return (
    <>
      <LoadingComponent loading={loading} />
      <ChangePasswordModal
        changePasswordModal={changePasswordModal}
        toggleChangePasswordModal={() =>
          setChangePasswordModal(!changePasswordModal)
        }
        setLoading={setLoading}
      />
      <UncontrolledDropdown
        tag="li"
        className="dropdown-user nav-item"
        size="lg"
      >
        <DropdownToggle
          href="/"
          tag="a"
          className="nav-link dropdown-user-link"
          onClick={(e) => e.preventDefault()}
        >
          {selectedUnit && (
            <Avatar
              img={selectedUnit.building.image}
              imgClassName="header-icon"
            />
          )}
        </DropdownToggle>
        <DropdownMenu
          end
          style={{
            backgroundColor: themeConfig.layout.primaryColor,
            color: "#fff",
            minWidth: "200px",
            borderRadius: "0px 20px 20px 20px",
            marginTop: "80px",
          }}
        >
          <div className="d-flex justify-content-center mx-1">
            {selectedUnit && (
              <Card
                className="mb-1"
                style={{
                  marginTop: "50px",
                  paddingRight: "5px",
                  paddingLeft: "5px",
                  width: "100%",
                }}
              >
                <Avatar
                  img={selectedUnit.building.image}
                  imgHeight="50"
                  imgWidth="50"
                  color={selectedUnit.id === "buildingManager" ? "success" : ""}
                  style={{
                    width: "58px",
                    height: "58px",
                    position: "absolute",
                    top: "-30px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    padding: "4px",
                  }}
                />
                <CardBody className="text-center d-flex flex-column">
                  <p
                    className="mb-0 mt-1 text-primary"
                    style={{
                      fontSize: "12px",
                      lineHeight: "1.2",
                    }}
                  >
                    {selectedUnit.building.name}
                    <br />
                    <span
                      className={
                        selectedUnit.id === "buildingManager"
                          ? "text-success"
                          : ""
                      }
                    >
                      {selectedUnit.id === "buildingManager" ? "" : "واحد "}
                      {selectedUnit.unit_number}
                    </span>
                    <br />
                    {user.first_name} {user.last_name}
                  </p>
                </CardBody>
              </Card>
            )}
          </div>
          <DropdownItem
            tag={Link}
            onClick={(e) => {
              localStorage.removeItem("selectedUnit");
              window.location.href = "/selectUnit";
            }}
            style={style}
          >
            <List size={14} className="me-75" />
            <span className="align-middle">لیست ساختمان ها</span>
          </DropdownItem>
          {selectedUnit && (
            <DropdownItem
              tag={Link}
              to={
                selectedUnit.id === "buildingManager"
                  ? "/buildingManager/profile"
                  : "/profile"
              }
              style={style}
            >
              <User size={14} className="me-75" />
              <span className="align-middle">پروفایل</span>
            </DropdownItem>
          )}
          <DropdownItem
            tag={Link}
            onClick={() => setChangePasswordModal(true)}
            style={style}
          >
            <Lock size={14} className="me-75" />
            <span className="align-middle">تغییر رمز عبور</span>
          </DropdownItem>
          <DropdownItem tag={Link} to="/logout" style={style}>
            <Power size={14} className="me-75" />
            <span className="align-middle">خروج</span>
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    </>
  );
};

export default UserDropdown;
