import { useState, lazy, useRef } from "react";
import { useEffect } from "react";
import classnames from "classnames";
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import Accounts from "./Accounts";
import Details from "./Details";

function Lazy({ visible, children }) {
  const rendered = useRef(visible);

  if (visible && !rendered.current) {
    rendered.current = true;
  }

  if (!rendered.current)
    return null;

  return <div style={{ display: visible ? 'block' : 'none' }}>{children}</div>;
}

const Settings = () => {
  const [activeTab, setActiveTab] = useState("accounts");
  return (
    <>
      <Nav pills>
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === "accounts" })}
            onClick={() => {
              setActiveTab("accounts");
            }}
          >
            حساب ها
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === "details" })}
            onClick={() => {
              setActiveTab("details");
            }}
          >
            تفضیل ها
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={activeTab}>
        <TabPane tabId="accounts">
          <Lazy visible={activeTab === "accounts"}>
            <Accounts />
          </Lazy>
        </TabPane>
        <TabPane tabId="details">
          <Lazy visible={activeTab === "details"}>
            <Details />
          </Lazy>
        </TabPane>
      </TabContent>
    </>
  );
};

export default Settings;
