// ** React Imports
import { Fragment, lazy } from "react";
import { Navigate } from "react-router-dom";
// ** Layouts
import BlankLayout from "@layouts/BlankLayout";
import VerticalLayout from "@src/layouts/VerticalLayout";
import HorizontalLayout from "@src/layouts/HorizontalLayout";
import LayoutWrapper from "@src/@core/layouts/components/layout-wrapper";

// ** Route Components
import PublicRoute from "@components/routes/PublicRoute";

// ** Utils
import { isObjEmpty } from "@utils";
import buildingManagerRoutes from "./buildingManagerRoutes";
import userRoutes from "./userRoutes";
import Announcements from "../../views/Announcements";


// import PaymentStatus from "../../views/PaymentStatus";
// import PayCharge from "../../views/PayCharge";
// import Faq from "../../views/Faq";
// import NewBuilding from "../../views/NewBuilding";
// import Reserve from "../../views/Reserve";
// import Survey from "../../views/Survey";
// import PayToll from "../../views/PayToll";
// import Pricing from "../../views/Pricing";


const PaymentStatus = lazy(() => import("../../views/PaymentStatus"));
const PayCharge = lazy(() => import("../../views/PayCharge"));
const Faq = lazy(() => import("../../views/Faq"));
const NewBuilding = lazy(() => import("../../views/NewBuilding"));
const Reserve = lazy(() => import("../../views/Reserve"));
const Survey = lazy(() => import("../../views/Survey"));
const PayToll = lazy(() => import("../../views/PayToll"));
const Pricing = lazy(() => import("../../views/Pricing"));


const getLayout = {
  blank: <BlankLayout />,
  vertical: <VerticalLayout />,
  horizontal: <HorizontalLayout />,
};

// ** Document title
const TemplateTitle = "%s";

const Login = lazy(() => import("../../views/Login"));
const Error = lazy(() => import("../../views/Error"));
// const Charity = lazy(() => import("../../views/Charity"));

const getUserHomePage = () => {
  const user = JSON.parse(localStorage.getItem("userData"));
  if (!user) {
    return "/login";
  }
  const role = user.role;
  if (role === "user") {
    return "/dashboard";
  }
  if (role === "building_manager") {
    return "/buildingManager/dashboard";
  }
};

const DefaultRoute = getUserHomePage();

// ** Merge Routes
let Routes = [
  {
    path: "/",
    index: true,
    element: <Navigate replace to={DefaultRoute} />,
    errorElement: <Navigate replace to="/error" />,
  },
  {
    path: "reserve/:slug",
    element: <Reserve />,
    meta: {
      layout: "blank",
    },
  },
  {
    path: "announcements/:slug",
    element: <Announcements />,
    meta: {
      layout: "blank",
    },
  },
  {
    path: "survey/:slug",
    element: <Survey />,
    meta: {
      layout: "blank",
    },
  },
  {
    path: "/login",
    element: <Login />,
    meta: {
      layout: "blank",
    },
  },
  {
    path: "/paymentStatus",
    element: <PaymentStatus />,
    meta: {
      layout: "blank",
    },
  },
  {
    path: "/payCharge",
    element: <PayCharge />,
    meta: {
      layout: "blank",
    },
  },
  {
    path: "/pay",
    element: <PayToll />,
    meta: {
      layout: "blank",
    },
  },
  {
    path: "/faq",
    element: <Faq />,
  },
  // {
  //   path: "/charity",
  //   element: <Charity />,
  //   meta: {
  //     layout: "blank",
  //   },
  // },
  {
    path: "/pricing",
    element: <Pricing />,
    meta: {
      layout: "blank",
    },
  },
  {
    path: "/newBuilding",
    element: <NewBuilding />,
  },
  {
    path: "/error",
    element: <Error />,
    meta: {
      layout: "blank",
    },
  },
  {
    path: "*",
    element: <Error />,
    meta: {
      layout: "blank",
    },
  },
];

Routes = [...Routes, ...userRoutes, ...buildingManagerRoutes];

const getRouteMeta = (route) => {
  if (isObjEmpty(route.element.props)) {
    if (route.meta) {
      return { routeMeta: route.meta };
    } else {
      return {};
    }
  }
};

// ** Return Filtered Array of Routes & Paths
const MergeLayoutRoutes = (layout, defaultLayout) => {
  const LayoutRoutes = [];

  if (Routes) {
    Routes.filter((route) => {
      let isBlank = false;
      // ** Checks if Route layout or Default layout matches current layout
      if (
        (route.meta && route.meta.layout && route.meta.layout === layout) ||
        ((route.meta === undefined || route.meta.layout === undefined) &&
          defaultLayout === layout)
      ) {
        const RouteTag = PublicRoute;
        // ** Check for public or private route
        if (route.meta) {
          route.meta.layout === "blank" ? (isBlank = true) : (isBlank = false);
        }
        if (route.element) {
          const Wrapper =
            // eslint-disable-next-line multiline-ternary
            isObjEmpty(route.element.props) && isBlank === false
              ? // eslint-disable-next-line multiline-ternary
              LayoutWrapper
              : Fragment;

          route.element = (
            <Wrapper {...(isBlank === false ? getRouteMeta(route) : {})}>
              <RouteTag route={route}>{route.element}</RouteTag>
            </Wrapper>
          );
        }

        // Push route to LayoutRoutes
        LayoutRoutes.push(route);
      }
      return LayoutRoutes;
    });
  }
  return LayoutRoutes;
};

const getRoutes = (layout) => {
  const defaultLayout = layout || "vertical";
  const layouts = ["vertical", "horizontal", "blank"];

  const AllRoutes = [];

  layouts.forEach((layoutItem) => {
    const LayoutRoutes = MergeLayoutRoutes(layoutItem, defaultLayout);

    AllRoutes.push({
      path: "/",
      element: getLayout[layoutItem] || getLayout[defaultLayout],
      children: LayoutRoutes,
    });
  });
  return AllRoutes;
};

export { DefaultRoute, TemplateTitle, Routes, getRoutes };
