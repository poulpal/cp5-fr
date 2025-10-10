import { useState, lazy, useRef } from "react";
import { useEffect } from "react";
// import BuildingManagers from "./Settings/BuildingManagers";
import classnames from "classnames";
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import ChargeSetting from "./Settings/ChargeSetting";
import GeneralSetting from "./Settings/GeneralSetting";
import BuildingManagers from "./Settings/BuildingManagers";
import DebtTypes from "./Settings/DebtTypes";

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
  const [activeTab, setActiveTab] = useState("buildingManagers");
  return (
    <>
      <Nav pills>
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === "buildingManagers" })}
            onClick={() => {
              setActiveTab("buildingManagers");
            }}
          >
            مدیران
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === "general" })}
            onClick={() => {
              setActiveTab("general");
            }}
          >
            تنظیمات
          </NavLink>
        </NavItem>
        {/* <NavItem>
          <NavLink
            className={classnames({ active: activeTab === "charge" })}
            onClick={() => {
              setActiveTab("charge");
            }}
          >
            تنظیمات پرداخت شارژ و جریمه
          </NavLink>
        </NavItem> */}
        {/* <NavItem>
          <NavLink
            className={classnames({ active: activeTab === "debtTypes" })}
            onClick={() => {
              setActiveTab("debtTypes");
            }}
          >
            سرفصل بدهی
          </NavLink>
        </NavItem> */}
        {/* <NavItem>
          <NavLink
            className={classnames({ active: activeTab === "incomeTypes" })}
            onClick={() => {
              setActiveTab("incomeTypes");
            }}
          >
            انواع درآمد ها
          </NavLink>
        </NavItem> */}
      </Nav>
      <TabContent activeTab={activeTab}>
        <TabPane tabId="buildingManagers">
          <Lazy visible={activeTab === "buildingManagers"}>
            <BuildingManagers />
          </Lazy>
        </TabPane>
        <TabPane tabId="general">
          <Lazy visible={activeTab === "general"}>
            <GeneralSetting />
          </Lazy>
        </TabPane>
        {/* <TabPane tabId="charge">
          <Lazy visible={activeTab === "charge"}>
            <ChargeSetting />
          </Lazy>
        </TabPane> */}
        <TabPane tabId="debtTypes">
          <Lazy visible={activeTab === "debtTypes"}>
            <DebtTypes />
          </Lazy>
        </TabPane>
        <TabPane tabId="incomeTypes">
          <Lazy visible={activeTab === "incomeTypes"}>
            انواع درآمد ها
          </Lazy>
        </TabPane>
      </TabContent>
    </>
  );
};

export default Settings;
