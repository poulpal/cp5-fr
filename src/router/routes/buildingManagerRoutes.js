// import Dashboard from "../../views/buildingManager/Dashboard";
// import Profile from "../../views/buildingManager/Profile";
// import NotVerified from "../../views/buildingManager/NotVerified";
// import Units from "../../views/buildingManager/Units";
// import Invoices from "../../views/buildingManager/Invoices";
// import Debts from "../../views/buildingManager/Debts";
// import Deposits from "../../views/buildingManager/Deposits";
// import Contacts from "../../views/buildingManager/Contacts";
// import DepositRequests from "../../views/buildingManager/DepositRequests";
// import Qrcodes from "../../views/buildingManager/Qrcodes";
// import Announcements from "../../views/buildingManager/Announcements";
// import VoiceMessages from "../../views/buildingManager/VoiceMessages";
// import Polls from "../../views/buildingManager/Polls";
// import Costs from "../../views/buildingManager/Costs";
// import Incomes from "../../views/buildingManager/Incomes";
// import Reserves from "../../views/buildingManager/Reserves";
// import Settings from "../../views/buildingManager/settings";
// import Banks from "../../views/buildingManager/Banks";
// import AccountingReports from "../../views/buildingManager/AccountingReports";
// import Stocks from "../../views/buildingManager/Stock";
// import Tolls from "../../views/buildingManager/Tolls";
// import Modules from "../../views/buildingManager/Modules";
// import Accounts from "../../views/buildingManager/Accounting/Accounts";
// import AddDocument from "../../views/buildingManager/Accounting/AddDocument";
// import Documents from "../../views/buildingManager/Accounting/Documents";
// import ShowDocument from "../../views/buildingManager/Accounting/ShowDocument";
// import Journal from "../../views/buildingManager/Accounting/Reports/Journal";
// import Ledger from "../../views/buildingManager/Accounting/Reports/Ledger";
// import TrialBalance from "../../views/buildingManager/Accounting/Reports/TrialBalance";
// import AccountLedger from "../../views/buildingManager/Accounting/Reports/AccountLedger";
// import BalanceSheet from "../../views/buildingManager/Accounting/Reports/BalanceSheet";
// import ProfitAndLoss from "../../views/buildingManager/Accounting/Reports/ProfitAndLoss";
// import SmsMessage from "../../views/buildingManager/SmsMessage";
// import Tickets from "../../views/buildingManager/Support/Tickets";
// import ShowTicket from "../../views/buildingManager/Support/ShowTicket";

import { Fragment, lazy } from "react";

const Dashboard = lazy(() => import("../../views/buildingManager/Dashboard"));
const Overview = lazy(() => import("../../views/buildingManager/Overview"));
const Profile = lazy(() => import("../../views/buildingManager/Profile"));
const NotVerified = lazy(() => import("../../views/buildingManager/NotVerified"));
const Units = lazy(() => import("../../views/buildingManager/Units"));
const Invoices = lazy(() => import("../../views/buildingManager/Invoices"));
const Debts = lazy(() => import("../../views/buildingManager/Debts"));
const Deposits = lazy(() => import("../../views/buildingManager/Deposits"));
const Contacts = lazy(() => import("../../views/buildingManager/Contacts"));
const DepositRequests = lazy(() => import("../../views/buildingManager/DepositRequests"));
const Qrcodes = lazy(() => import("../../views/buildingManager/Qrcodes"));
const Announcements = lazy(() => import("../../views/buildingManager/Announcements"));
const VoiceMessages = lazy(() => import("../../views/buildingManager/VoiceMessages"));
const Polls = lazy(() => import("../../views/buildingManager/Polls"));
const Costs = lazy(() => import("../../views/buildingManager/Costs"));
const Incomes = lazy(() => import("../../views/buildingManager/Incomes"));
const Reserves = lazy(() => import("../../views/buildingManager/Reserves"));
const Settings = lazy(() => import("../../views/buildingManager/Settings"));
const Banks = lazy(() => import("../../views/buildingManager/Banks"));
// const AccountingReports = lazy(() => import("../../views/buildingManager/AccountingReports"));
const Stocks = lazy(() => import("../../views/buildingManager/Stock"));
const Tolls = lazy(() => import("../../views/buildingManager/Tolls"));
const Modules = lazy(() => import("../../views/buildingManager/Modules"));
const Accounts = lazy(() => import("../../views/buildingManager/Accounting/Accounts"));
const Coding = lazy(() => import("../../views/buildingManager/Accounting/Coding"));
const AddDocument = lazy(() => import("../../views/buildingManager/Accounting/AddDocument"));
const Documents = lazy(() => import("../../views/buildingManager/Accounting/Documents"));
const ShowDocument = lazy(() => import("../../views/buildingManager/Accounting/ShowDocument"));
const Journal = lazy(() => import("../../views/buildingManager/Accounting/Reports/Journal"));
const Ledger = lazy(() => import("../../views/buildingManager/Accounting/Reports/Ledger"));
const TrialBalance = lazy(() => import("../../views/buildingManager/Accounting/Reports/TrialBalance"));
const AccountLedger = lazy(() => import("../../views/buildingManager/Accounting/Reports/AccountLedger"));
const BalanceSheet = lazy(() => import("../../views/buildingManager/Accounting/Reports/BalanceSheet"));
const ProfitAndLoss = lazy(() => import("../../views/buildingManager/Accounting/Reports/ProfitAndLoss"));
const SmsMessage = lazy(() => import("../../views/buildingManager/SmsMessage"));
const FcmMessage = lazy(() => import("../../views/buildingManager/FcmMessage"));
const Tickets = lazy(() => import("../../views/buildingManager/Support/Tickets"));
const ShowTicket = lazy(() => import("../../views/buildingManager/Support/ShowTicket"));
const Factors = lazy(() => import("../../views/buildingManager/Factors"));
const Forum = lazy(() => import("../../views/buildingManager/Forum"));
const Cash = lazy(() => import("../../views/buildingManager/Cash"));

let buildingManagerRoutes = [
  {
    path: "/overview",
    element: <Overview />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/profile",
    element: <Profile />
  },
  {
    path: "/settings",
    element: <Settings />
  },
  // {
  //   path: "/banks",
  //   element: <Banks />
  // },
  {
    path: "/banks",
    element: <Banks />
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
    path: "/debts",
    element: <Debts />
  },
  {
    path: "/tolls",
    element: <Tolls />
  },
  {
    path: "/deposits",
    element: <Deposits />
  },
  {
    path: "/costs",
    element: <Costs />
  },
  // {
  //   path: "/incomes",
  //   element: <Incomes />
  // },
  {
    path: "/contacts",
    element: <Contacts />
  },
  {
    path: "/depositRequests",
    element: <DepositRequests />
  },
  {
    path: "/factors",
    element: <Factors />
  },
  {
    path: "/cash",
    element: <Cash />
  },
  {
    path: "/getQrCodes",
    element: <Qrcodes />
  },
  {
    path: "/announcements",
    element: <Announcements />
  },
  {
    path: "/voiceMessages",
    element: <VoiceMessages />
  },
  {
    path: "/smsMessage",
    element: <SmsMessage />
  },
  {
    path: "/fcmMessage",
    element: <FcmMessage />
  },
  {
    path: "/polls",
    element: <Polls />
  },
  {
    path: "/reserves",
    element: <Reserves />
  },
  // {
  //   path: "/accountingReports",
  //   element: <AccountingReports />
  // },
  {
    path: "/stock",
    element: <Stocks />
  },
  {
    path: "/modules",
    element: <Modules />
  },
  {
    path: "/accounts",
    element: <Coding />
  },
  {
    path: "/addDocument",
    element: <AddDocument />
  },
  {
    path: "/documents",
    element: <Documents />
  },
  {
    path: "/documents/:number",
    element: <ShowDocument />
  },
  {
    path: "/reports/journal",
    element: <Journal />
  },
  {
    path: "/reports/ledger",
    element: <Ledger />
  },
  {
    path: "/reports/accountLedger",
    element: <AccountLedger />
  },
  {
    path: "/reports/trialBalance",
    element: <TrialBalance />
  },
  {
    path: "/reports/balanceSheet",
    element: <BalanceSheet />
  },
  {
    path: "/reports/profitAndLoss",
    element: <ProfitAndLoss />
  },
  {
    path: "/support",
    element: <Tickets />
  },
  {
    path: "/support/:id",
    element: <ShowTicket />
  },
  {
    path: "/forum",
    element: <Forum />
  },
];

buildingManagerRoutes = buildingManagerRoutes.map((route) => {
  if (route.meta === undefined) {
    route.meta = {};
  }
  const userVerified = localStorage.getItem("userVerified");
  if (userVerified == "false") {
    if (route.path == "/depositRequests") {
      return {
        path: "/buildingManager" + route.path,
        element: <NotVerified />,
      }
    }
  }
  route.meta.role = "buildingManager";
  route.path = "/buildingManager" + route.path;
  return route;
});

export default buildingManagerRoutes;
