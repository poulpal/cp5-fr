import {
  faHeadset,
  faQuestionCircle,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Navbar,
  NavbarBrand,
  NavbarText,
  Tooltip,
  UncontrolledTooltip,
} from "reactstrap";
import { isUserLoggedIn } from "../auth/auth";
import SupportButton from "./SupportButton";
import LogoutIcon from "@src/assets/images/icons/logout.svg";
import FaqIcon from "@src/assets/images/icons/faq.svg";
import CoinLogo from "@src/assets/images/logo/chargepal2.png";
import CoinLogoAlt from "@src/assets/images/logo/chargepal-alt2.png";

import Swal from "sweetalert2/dist/sweetalert2.all.js";
import withReactContent from "sweetalert2-react-content";
import "@styles/base/plugins/extensions/ext-component-sweet-alerts.scss";
import themeConfig from "@configs/themeConfig";

const NavbarComponent = ({ withImage, centerNavbarBrand, hideButtons = false }) => {
  if (centerNavbarBrand == undefined) {
    centerNavbarBrand = false;
  }

  const MySwal = withReactContent(Swal);

  return (
    <Navbar
      dark
      style={{
        backgroundColor: themeConfig.layout.primaryColor,
        height: withImage ? "calc(100vh - 250px)" : "4.45rem",
        backgroundImage: withImage ? "url(/images/bg.png)" : "none",
        backgroundSize: "cover",
        filter: withImage
          ? "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))"
          : "none",
      }}
      className="align-items-start"
    >
      {/* {centerNavbarBrand && <div></div>} */}
      <NavbarBrand
        href={import.meta.env.VITE_APP_TYPE === "standalone" ? window._env_.APP_URL : import.meta.env.VITE_LANDING_URL}
        className="d-none d-md-block"
        style={
          false
            ? {
              position: "absolute",
              right: "50%",
              transform: "translateX(50%)",
            }
            : {}
        }
      >
        <span className="d-flex flex-column align-items-center">
          {import.meta.env.VITE_APP_TYPE == 'main' && (
            <img
              src={CoinLogo}
              alt="ChargePal"
              className=""
              style={{
                // width: "100px",
                height: withImage ? "70px" : "50px",
              }}
            />
          )}
          {import.meta.env.VITE_APP_TYPE == 'standalone' && (
            <img
              src={window._env_.APP_ICON}
              alt={window._env_.APP_NAME}
              className=""
              style={{
                // width: "100px",
                height: withImage ? "70px" : "50px",
              }}
            />
          )}
          {/* <h1
            className="brand-text m-0 p-0"
            style={{
              fontSize: "24px",
            }}
          >
            POULPAL
          </h1>
          <span
            className={
              "text-center w-100 me-auto ms-auto " +
              (withImage ? "text-white" : "text-white")
            }
            style={{
              fontSize: "14px",
            }}
          >
            سامانه مدیریت آپارتمان
          </span> */}
        </span>
      </NavbarBrand>
      {!hideButtons && (
        <NavbarText>
          <SupportButton withImage={withImage} />
          <UncontrolledTooltip placement="bottom" target="faq">
            سوالات متداول
          </UncontrolledTooltip>
          <Link to="/faq" id="faq">
            <img
              src={FaqIcon}
              alt="faq"
              className="me-1 header-icon"
              style={{
                color: "#fff",
              }}
            />
          </Link>
          {isUserLoggedIn() && (
            <>
              <UncontrolledTooltip placement="bottom" target="logout">
                خروج
              </UncontrolledTooltip>
              <Link id="logout"
                onClick={(e) => {
                  e.preventDefault();
                  MySwal.fire({
                    title: "آیا برای خروج مطمئن هستید؟",
                    icon: "warning",
                    showCancelButton: true,
                    customClass: {
                      confirmButton: "btn btn-danger",
                      cancelButton: "btn btn-dark ms-1",
                    },
                    confirmButtonText: "خروج",
                    cancelButtonText: "انصراف",
                  }).then((result) => {
                    if (result.isConfirmed) {
                      window.location.href = "/logout";
                    }
                  });
                }}
              >
                <img
                  src={LogoutIcon}
                  alt="logout"
                  className="me-1 header-icon"
                  style={{
                    color: "#fff",
                  }}
                />
              </Link>
            </>
          )}
        </NavbarText>
      )}
    </Navbar>
  );
};

export default NavbarComponent;
