// ** Dropdowns Imports
import UserDropdown from "./UserDropdown";
import { NavItem, NavLink, Tooltip, UncontrolledTooltip } from "reactstrap";
import { Link } from "react-router-dom";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeadset,
  faQuestionCircle,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import SupportButton from "../../../../components/SupportButton";
import LogoutIcon from "@src/assets/images/icons/logout.svg";
import FaqIcon from "@src/assets/images/icons/faq.svg";

import Swal from "sweetalert2/dist/sweetalert2.all.js";
import withReactContent from "sweetalert2-react-content";
import "@styles/base/plugins/extensions/ext-component-sweet-alerts.scss";

const NavbarUser = () => {
  const [faqTooltip, setFaqTooltip] = useState(false);

  const MySwal = withReactContent(Swal);

  return (
    <ul className="nav navbar-nav align-items-center ms-auto">
      <SupportButton withImage={false} />
      <Tooltip
        placement="bottom"
        isOpen={faqTooltip}
        target="faq"
        toggle={() => setFaqTooltip(!faqTooltip)}
      >
        سوالات متداول
      </Tooltip>
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
      <div
        style={{
          marginLeft: "5px",
          marginRight: "-10px",
        }}
      >
        <UserDropdown />
      </div>
      <>
        <UncontrolledTooltip placement="bottom" target="logout">
          خروج
        </UncontrolledTooltip>
        <Link id="logout"
        className="d-none d-md-block"
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
    </ul>
  );
};
export default NavbarUser;
