// ** React Imports
import { NavLink, useNavigate } from "react-router-dom";

// ** Third Party Components
import classnames from "classnames";
import { useTranslation } from "react-i18next";

// ** Reactstrap Imports
import { Badge } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { Lock } from "@mui/icons-material";

const VerticalNavMenuLink = ({ item, activeItem }) => {
  // ** Conditional Link Tag, if item has newTab or externalLink props use <a> tag else use NavLink
  const LinkTag = item.externalLink ? "a" : NavLink;
  const navigate = useNavigate();

  // ** Hooks
  const { t } = useTranslation();

  return (
    <li
      className={classnames({
        "nav-item": !item.children,
        disabled: item.disabled,
        active: item.navLink === activeItem,
        "d-none": item?.hidden === true,
      })}
    >
      <LinkTag
        className="d-flex align-items-center"
        target={item.newTab ? "_blank" : undefined}
        /*eslint-disable */
        {...(item.externalLink === true
          ? {
            href: item.navLink || "/",
          }
          : {
            to: item.navLink || "/",
            className: ({ isActive }) => {
              if (isActive && !item.disabled) {
                return "d-flex align-items-center active";
              }
            },
          })}
        onClick={(e) => {
          if (
            item.locked === true) {
            e.preventDefault();
            navigate("/buildingManager/modules");
          }
          if (
            item.navLink.length === 0 ||
            item.navLink === "#" ||
            item.disabled === true
          ) {
            e.preventDefault();
          }
        }}
      >
        {item.icon}
        <span className="menu-item text-truncate">{t(item.title)}</span>
        {item.new && (
          <span className="menu-item" style={{ marginRight: "8px" }}>
            <div class="circle red"></div>
          </span>
        )}
        {item.locked && (
          <span className="position-absolute end-0 me-1">
            <Lock sx={{ fontSize: 40 }} />
          </span>
        )}
        {item.badge && item.badgeText ? (
          <Badge className="ms-auto me-1" color={item.badge} pill>
            {item.badgeText}
          </Badge>
        ) : null}
      </LinkTag>
    </li>
  );
};

export default VerticalNavMenuLink;
