// ** React Imports
import { useEffect } from "react";
import { NavLink } from "react-router-dom";

// ** Icons Imports
import { Disc, X, Circle } from "react-feather";

// ** Config
import themeConfig from "@configs/themeConfig";
import CoinLogo from "@src/assets/images/logo/chargepal2.png";

// ** Utils
import { getUserData, getHomeRouteForLoggedInUser } from "@utils";

const VerticalMenuHeader = (props) => {
  // ** Props
  const {
    menuCollapsed,
    setMenuCollapsed,
    setMenuVisibility,
    setGroupOpen,
    menuHover,
  } = props;

  // ** Vars
  const user = getUserData();

  // ** Reset open group
  useEffect(() => {
    if (!menuHover && menuCollapsed) setGroupOpen([]);
  }, [menuHover, menuCollapsed]);

  // ** Menu toggler component
  const Toggler = () => {
    if (!menuCollapsed) {
      return (
        <Disc
          size={20}
          data-tour="toggle-icon"
          className="text-primary toggle-icon d-none d-xl-block"
          onClick={() => setMenuCollapsed(true)}
        />
      );
    } else {
      return (
        <Circle
          size={20}
          data-tour="toggle-icon"
          className="text-primary toggle-icon d-none d-xl-block"
          onClick={() => setMenuCollapsed(false)}
        />
      );
    }
  };

  return (
    <div className="navbar-header">
      <ul className="nav navbar-nav flex-row">
        <li className="nav-item me-auto ms-auto">
          <NavLink to={import.meta.env.VITE_APP_TYPE === "standalone" ? window._env_.APP_URL : import.meta.env.VITE_LANDING_URL} className="navbar-brand">
            <span className="d-flex flex-column align-items-center">
              {import.meta.env.VITE_APP_TYPE == 'main' && (
                <img
                  src={CoinLogo}
                  alt="ChargePal"
                  className=""
                  style={{
                    // width: "100px",
                    height: "60px",
                  }}
                />
              )}
              {import.meta.env.VITE_APP_TYPE == 'standalone' && (
                <img
                  src={window._env_.APP_ICON}
                  alt={window._env_.APP_NAME}
                  className=""
                  style={{
                    width: "180px",
                    height: "60px",
                  }}
                />
              )}
              {import.meta.env.VITE_APP_TYPE == 'a444' && (
                <>
                  <h1
                    className="brand-text m-0 p-0"
                    style={{
                      fontSize: "30px",
                      letterSpacing: "5px",
                    }}
                  >
                    A444
                  </h1>
                  <span
                    className="text-center w-100 me-auto ms-auto"
                    style={{
                      fontSize: "16px",
                    }}
                  >
                    سامانه مدیریت آپارتمان
                  </span>
                </>
              )}

            </span>
          </NavLink>
        </li>
        <li className="nav-item nav-toggle">
          <div className="nav-link modern-nav-toggle cursor-pointer">
            <X
              onClick={() => setMenuVisibility(false)}
              className="toggle-icon icon-x d-block d-xl-none"
              size={20}
            />
          </div>
        </li>
      </ul>
      <hr />
    </div>
  );
};

export default VerticalMenuHeader;
