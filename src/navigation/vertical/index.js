import {
  User,
  Home,
  LogOut,
  List,
  DollarSign,
  BookOpen,
  Download,
  HelpCircle,
  Bookmark,
  Phone,
  ExternalLink,
  Settings,
  BarChart2
} from "react-feather";

import { getUserRole } from "@src/auth/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQrcode, faMicrophone, faPoll, faMoneyBill, faFileInvoiceDollar, faMoneyBillTrendUp, faDownload, faWarehouse, faReceipt, faBell, faTags, faAward, faEnvelope, faLink, faFileInvoice, faMessage, faMoneyBillAlt } from "@fortawesome/free-solid-svg-icons";
import { faNewspaper, faCalendarCheck } from "@fortawesome/free-regular-svg-icons";
import axios from "axios";

const userRole = getUserRole();
const selectedUnit = localStorage.getItem("selectedUnit");

let buildingUnitOptions = {}

try {
  buildingUnitOptions = JSON.parse(localStorage.getItem("buildingUnitOptions"));
} catch (error) {
  console.log(error);
}

const getSelectedUnit = async () => {
  const selectedUnitId = localStorage.getItem("selectedUnit");
  if (!selectedUnitId) return;
  if (selectedUnitId == 'buildingManager') return;
  try {
    const response = await axios.get("/user/units/" + selectedUnitId);
    buildingOptions = response.data.data.options;
  } catch (error) {
    console.log(error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    }
  }
};

getSelectedUnit();

let showAccountingReport = false;

if (selectedUnit == 'buildingManager') {
  const slug = localStorage.getItem("buildingSlug");
  if (slug == 'jamtower') {
    showAccountingReport = true;
  }
}

const activeModules = JSON.parse(localStorage.getItem("activeModules")) ?? [];


// ===== کمکی: الیاس اسلاگ‌ها و چک دسترسی ماژول =====
const MODULE_ALIASES = {
  'accounting-advanced':    ['accounting-advanced-1','accounting-advanced-qr'],
  'accounting-advanced-1':  ['accounting-advanced','accounting-advanced-qr'],
  'accounting-advanced-qr': ['accounting-advanced','accounting-advanced-1']
};

const activeModuleSlugs = (activeModules || []).map(m => (m && m.slug) ? m.slug : m);

const hasModule = (requiredSlug) => {
  const set = new Set([requiredSlug, ...(MODULE_ALIASES[requiredSlug] || [])]);
  return activeModuleSlugs.some(s => set.has(s));
};



export const userNavigation = [
  {
    id: "home",
    title: "داشبورد",
    icon: <Home size={20} />,
    navLink: "/overview",
  },
  {
    id: "profile",
    title: "پروفایل",
    icon: <User size={20} />,
    navLink: "/profile",
    disabled: !selectedUnit,
  },
  {
    id: "wallet",
    title: "کیف پول",
    icon: <DollarSign size={20} />,
    navLink: "/wallet",
    new: true,
    disabled: !selectedUnit,
    hideInDashboard: true,
  },
  {
    id: "tolls",
    title: "لینک پرداخت",
    icon: <FontAwesomeIcon icon={faLink} />,
    navLink: "/tolls",
    new: true,
    disabled: !selectedUnit,
  },
  {
    id: "transactions",
    title: "تراکنش ها",
    icon: <List size={20} />,
    navLink: "/transactions",
  },
  // {
  //   id: "invoices",
  //   title: "صورتحساب ها",
  //   icon: <DollarSign size={20} />,
  //   navLink: "/invoices",
  // },
  {
    id: "myUnit",
    title: "واحد من",
    icon: <Bookmark size={20} />,
    navLink: "/myUnit",
    disabled: !selectedUnit,
  },
  {
    id: "buildingCosts",
    title: "هزینه های ساختمان",
    icon: <FontAwesomeIcon icon={faFileInvoiceDollar} />,
    navLink: "/buildingCosts",
    disabled: !selectedUnit,
    hidden: !buildingUnitOptions?.showCosts,
    hideInDashboard: !buildingUnitOptions?.showCosts,
  },
  {
    id: "buildingStocs",
    title: "انبار ساختمان",
    icon: <FontAwesomeIcon icon={faWarehouse} />,
    navLink: "/buildingStocks",
    disabled: !selectedUnit,
    hidden: !buildingUnitOptions?.showStocks,
    hideInDashboard: !buildingUnitOptions?.showStocks,
  },
  {
    id: "buildingCash",
    title: "موجودی نقد ساختمان",
    icon: <FontAwesomeIcon icon={faMoneyBillAlt} />,
    navLink: "/buildingCash",
    disabled: !selectedUnit,
    hidden: !buildingUnitOptions?.showBalances,
    hideInDashboard: !buildingUnitOptions?.showBalances,
  },
  {
    id: "forum",
    title: "انجمن",
    icon: <FontAwesomeIcon icon={faMessage} />,
    navLink: "/forum",
    disabled: !selectedUnit,
  },
  {
    id: "contacts",
    title: "دفترچه تماس",
    icon: <Phone size={20} />,
    navLink: "/contacts",
    disabled: !selectedUnit,
  },
  {
    id: "announcements",
    title: "اطلاعیه ها",
    icon: <FontAwesomeIcon icon={faNewspaper} />,
    navLink: "/announcements",
    disabled: !selectedUnit,
  },
  {
    id: "polls",
    title: "انتخابات / نظرسنجی",
    icon: <FontAwesomeIcon icon={faPoll} />,
    navLink: "/polls",
    disabled: !selectedUnit,
  },
  {
    id: "reserve",
    title: "رزرو مشاعات",
    icon: <FontAwesomeIcon icon={faCalendarCheck} />,
    navLink: "/reserve",
    disabled: !selectedUnit,
  },
  {
    id: "logout",
    title: "خروج",
    icon: <LogOut size={20} />,
    navLink: "/logout",
    hideInDashboard: true,
  },
];

export const buildingManagerNavigation = [
  {
    id: "dashboard",
    title: "داشبورد",
    icon: <Home size={20} />,
    navLink: "/dashboard",
    hideInDashboard: true,
  },
  {
    id: "overview",
    title: "گزارش کلی",
    icon: <BarChart2 size={20} />,
    navLink: "/overview",
  },
  {
    id: "profile",
    title: "پروفایل",
    icon: <User size={20} />,
    navLink: "/profile",
  },
  {
    id: "units",
    title: "واحدها",
    icon: <List size={20} />,
    navLink: "/units",
  },
  {
    id: "settings",
    title: "تنظیمات ساختمان",
    icon: <Settings size={20} />,
    navLink: "/settings",
  },
  {
    id: "getQrCodes",
    title: "دریافت QR کد",
    icon: <FontAwesomeIcon icon={faQrcode} />,
    navLink: "/getQrCodes",
  },
  // {
  //   id: 'settings',
  //   title: 'تنظیمات و تعاریف',
  //   icon: <Settings size={20} />,
  //   children: [
  //     {
  //       id: "settings",
  //       title: "تنظیمات ساختمان",
  //       navLink: "/buildingManager/settings",
  //     },
  //     {
  //       id: "units",
  //       title: "واحدها",
  //       icon: <List size={20} />,
  //       navLink: "/buildingManager/units",
  //     },
  //     // {
  //     //   id: "banks",
  //     //   title: "بانک ها",
  //     //   // icon: <List size={20} />,
  //     //   navLink: "/buildingManager/banks",
  //     // },
  //     // {
  //     //   id: "persons",
  //     //   title: "اشخاص",
  //     //   // icon: <List size={20} />,
  //     //   navLink: "/buildingManager/persons",
  //     // },
  //   ],
  // },
  {
    id: 'reports',
    title: 'امور مالی',
    icon: <FontAwesomeIcon icon={faReceipt} />,
    children: [
      {
        id: "debts",
        title: "بدهی ها",
        // icon: <BookOpen size={20} />,
        navLink: "/buildingManager/debts",
      },
      {
        id: "deposits",
        title: "پرداختی ها",
        // icon: <Download size={20} />,
        navLink: "/buildingManager/deposits",
      },
      {
        id: "tolls",
        title: "لینک پرداخت",
        // icon: <FontAwesomeIcon icon={faLink} />,
        navLink: "/buildingManager/tolls",
      },
      {
        id: "costs",
        title: "هزینه ها",
        // icon: <FontAwesomeIcon icon={faFileInvoiceDollar} />,
        navLink: "/buildingManager/costs",
      },
      {
        id: "invoices",
        title: "صورتحساب ها",
        // icon: <DollarSign size={20} />,
        navLink: "/buildingManager/invoices",
      },
      {
        id: "depositRequests",
        title: "واریز به حساب",
        // icon: <ExternalLink size={20} />,
        navLink: "/buildingManager/depositRequests",
      },
      {
        id: "factors",
        title: "فاکتور ها",
        // icon: <FontAwesomeIcon icon={faFileInvoice} />,
        navLink: "/buildingManager/factors"
      },
      {
        id: "cash",
        title: "موجودی نقد",
        // icon: <FontAwesomeIcon icon={faFileInvoice} />,
        navLink: "/buildingManager/cash"
      },
    ],
  },
  // {
  //   id: "invoices",
  //   title: "صورتحساب ها",
  //   icon: <DollarSign size={20} />,
  //   navLink: "/invoices",
  // },
  // {
  //   id: "debts",
  //   title: "بدهی ها",
  //   icon: <BookOpen size={20} />,
  //   navLink: "/debts",
  // },
  // {
  //   id: "deposits",
  //   title: "پرداختی ها",
  //   icon: <Download size={20} />,
  //   navLink: "/deposits",
  // },
  // {
  //   id: "tolls",
  //   title: "لینک پرداخت",
  //   icon: <FontAwesomeIcon icon={faLink} />,
  //   navLink: "/tolls",
  // },
  {
    id: "accounting",
    title: "حسابداری پیشرفته",
    icon: <FontAwesomeIcon icon={faMoneyBill} />,
    hidden: import.meta.env.VITE_APP_TYPE == 'a444',
    hideInDashboard: import.meta.env.VITE_APP_TYPE == 'a444',
    children: [
      {
        id: "accounts",
        title: "کدینگ",
        navLink: "/buildingManager/accounts",
        locked: !hasModule("accounting-advanced"),
      },
      {
        id: "addDocument",
        title: "سند جدید",
        navLink: "/buildingManager/addDocument",
        locked: !hasModule("accounting-advanced"),
      },
      {
        id: "documents",
        title: "اسناد",
        navLink: "/buildingManager/documents",
        locked: !hasModule("accounting-advanced"),
      },
      {
        id: "accountingReports",
        title: "گزارش ها",
        navLink: "/buildingManager/reports",
        children: [
          {
            id: "journal",
            title: "دفتر روزنامه",
            navLink: "/buildingManager/reports/journal",
            locked: !hasModule("accounting-advanced"),
          },
          {
            id: "ledger",
            title: "دفتر کل",
            navLink: "/buildingManager/reports/ledger",
            locked: !hasModule("accounting-advanced"),
          },
          {
            id: "accountLedger",
            title: "دفتر حساب",
            navLink: "/buildingManager/reports/accountLedger",
            locked: !hasModule("accounting-advanced"),
          },
          {
            id: "trialBalance",
            title: "تراز آزمایشی",
            navLink: "/buildingManager/reports/trialBalance",
            locked: !hasModule("accounting-advanced"),
          },
          {
            id: "balanceSheet",
            title: "ترازنامه",
            navLink: "/buildingManager/reports/balanceSheet",
            locked: !hasModule("accounting-advanced"),
          },
          {
            id: "profitAndLoss",
            title: "صورت سود و زیان",
            navLink: "/buildingManager/reports/profitAndLoss",
            locked: !hasModule("accounting-advanced"),
          },
          // {
          //   id: "depositRequests",
          //   title: "واریز به حساب",
          //   // icon: <ExternalLink size={20} />,
          //   navLink: "/buildingManager/depositRequests",
          // },
        ],
      },
      // {
      //   id: "depositRequests",
      //   title: "عودت وجه",
      //   // icon: <ExternalLink size={20} />,
      //   navLink: "/buildingManager/depositRequests",
      // },
    ],
  },
  {
    id: 'notifications',
    title: 'اطلاع رسانی',
    icon: <FontAwesomeIcon icon={faBell} />,
    children: [
      {
        id: "announcements",
        title: "اطلاعیه ها",
        navLink: "/buildingManager/announcements",
      },
      {
        id: "voiceMessages",
        title: "پیام های صوتی",
        navLink: "/buildingManager/voiceMessages",
      },
      {
        id: "smsMessage",
        title: "پیام های متنی",
        navLink: "/buildingManager/smsMessage",
      },
      {
        id: "fcmMessage",
        title: "نوتیفیکیشن",
        navLink: "/buildingManager/fcmMessage",
      },
      {
        id: "forum",
        title: "انجمن",
        navLink: "/buildingManager/forum",
      },
    ],
  },
  // {
  //   id: "costs",
  //   title: "هزینه ها",
  //   icon: <FontAwesomeIcon icon={faFileInvoiceDollar} />,
  //   navLink: "/costs",
  // },
  // {
  //   id: "incomes",
  //   title: "درآمد ها",
  //   icon: <FontAwesomeIcon icon={faMoneyBillTrendUp} />,
  //   navLink: "/incomes",
  // },
  {
    id: "stock",
    title: "انبارداری",
    icon: <FontAwesomeIcon icon={faWarehouse} />,
    navLink: "/stock",
    // locked: !activeModules.filter((module) => module.slug == "stocks").length,
  },
  // {
  //   id: 'accounting',
  //   title: 'حسابداری',
  //   icon: <FontAwesomeIcon icon={faDollarSign} />,
  //   children: [
  //     {
  //       id: "ledger",
  //       title: "دفتر کل",
  //       // icon: <DollarSign size={20} />,
  //       navLink: "/buildingManager/ledger",
  //     },
  //     {
  //       id: "depositRequests",
  //       title: "واریز به حساب",
  //       // icon: <ExternalLink size={20} />,
  //       navLink: "/buildingManager/depositRequests",
  //     },
  //   ],
  // },
  {
    id: "contacts",
    title: "دفترچه تماس",
    icon: <Phone size={20} />,
    navLink: "/contacts",
  },
  {
    id: "polls",
    title: "انتخابات / نظرسنجی",
    icon: <FontAwesomeIcon icon={faPoll} />,
    navLink: "/polls",
    // locked: !activeModules.filter((module) => module.slug == "reserve-and-poll").length,
  },
  {
    id: "reserves",
    title: "مدیریت مشاعات",
    icon: <FontAwesomeIcon icon={faCalendarCheck} />,
    navLink: "/reserves",
    // locked: !activeModules.filter((module) => module.slug == "reserve-and-poll").length,
  },
  {
    id: "modules",
    title: "پکیج ها",
    icon: <FontAwesomeIcon icon={faAward} />,
    navLink: "/modules",
    hidden: import.meta.env.VITE_APP_TYPE == 'a444',
    hideInDashboard: import.meta.env.VITE_APP_TYPE == 'a444',
  },
  {
    id: "support",
    title: "پشتیبانی",
    icon: <FontAwesomeIcon icon={faEnvelope} />,
    navLink: "/support"
  },

];

const publicNavigation = [
  {
    id: "dashboard",
    title: "داشبورد",
    icon: <Home size={20} />,
    navLink: "/dashboard",
  },
  {
    id: "faq",
    title: "سوالات متداول",
    icon: <HelpCircle size={20} />,
    navLink: "/faq",
  },
]


buildingManagerNavigation.map((item) => {
  if (item.navLink == "/logout") return item;
  if (item.navLink == "/faq") return item;
  item.navLink = "/buildingManager" + item.navLink;
  if (!selectedUnit) {
    if (item.id == "dashboard") return item;
    item.disabled = true;
    item.children?.map((child) => {
      child.disabled = true;
    });
  }
});

export default userRole === "user" ? userNavigation : userRole === "buildingManager" ? buildingManagerNavigation : publicNavigation;
