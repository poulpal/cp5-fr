// import Logout from "../../views/Logout";
// import Dashboard from "../../views/user/Dashboard";
// import Profile from "../../views/user/Profile";
// import Units from "../../views/user/Units";
// import Invoices from "../../views/user/Invoices";
// import SelectUnit from "../../views/user/SelectUnit";
// import MyUnit from "../../views/user/MyUnit";
// import Contacts from "../../views/user/Contacts";
// import Announcements from "../../views/user/Announcements";
// import Polls from "../../views/user/Polls";
// import Wallet from "../../views/user/Wallet";
// import Transactions from "../../views/user/Transactions";
// import Tolls from "../../views/user/Tolls";
import { Fragment, lazy } from "react";
// import Reserve from "../../views/user/Reserve";

const Logout = lazy(() => import("../../views/Logout"));
const Overview = lazy(() => import("../../views/user/Overview"));
const Dashboard = lazy(() => import("../../views/user/Dashboard"));
const Profile = lazy(() => import("../../views/user/Profile"));
const Units = lazy(() => import("../../views/user/Units"));
const Invoices = lazy(() => import("../../views/user/Invoices"));
const SelectUnit = lazy(() => import("../../views/user/SelectUnit"));
const MyUnit = lazy(() => import("../../views/user/MyUnit"));
const Contacts = lazy(() => import("../../views/user/Contacts"));
const Announcements = lazy(() => import("../../views/user/Announcements"));
const Polls = lazy(() => import("../../views/user/Polls"));
const Wallet = lazy(() => import("../../views/user/Wallet"));
const Transactions = lazy(() => import("../../views/user/Transactions"));
const Tolls = lazy(() => import("../../views/user/Tolls"));
const Reserve = lazy(() => import("../../views/user/Reserve"));
const BuildingCosts = lazy(() => import("../../views/user/BuildingCosts"));
const BuildingStock = lazy(() => import("../../views/user/BuildingStock"));
const BuildingCash = lazy(() => import("../../views/user/BuildingCash"));
const Forum = lazy(() => import("../../views/user/Forum"));

let userRoutes = [
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/overview",
    element: <Overview />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/logout",
    element: <Logout />
  },
  {
    path: "/units",
    element: <Units />,
  },
  {
    path: "/invoices",
    element: <Invoices />,
  },
  {
    path: "/selectUnit",
    element: <SelectUnit />,
  },
  {
    path: "/myUnit",
    element: <MyUnit />,
  },
  {
    path: "/contacts",
    element: <Contacts />
  },
  {
    path: "/announcements",
    element: <Announcements />
  },
  {
    path: "/polls",
    element: <Polls />
  },
  {
    path: "/wallet",
    element: <Wallet />,
  },
  {
    path: "/transactions",
    element: <Transactions />,
    meta: {
      // layout: "blank",
    },
  },
  {
    path: "/tolls",
    element: <Tolls />,
  },
  {
    path: "/reserve",
    element: <Reserve />,
  },
  {
    path: "/buildingCosts",
    element: <BuildingCosts />
  },
  {
    path: "/buildingStocks",
    element: <BuildingStock />
  },
  {
    path: "/forum",
    element: <Forum />
  },
  {
    path: "/buildingCash",
    element: <BuildingCash />
  },
];

userRoutes = userRoutes.map((route) => {
  if (route.meta === undefined) {
    route.meta = {};
  }
  route.meta.role = "user";
  return route;
});

export default userRoutes;
