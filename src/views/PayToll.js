import { Navigate, useSearchParams } from "react-router-dom";
import themeConfig from "@configs/themeConfig";

import "@styles/base/pages/page-misc.scss";
import { useEffect } from "react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import PriceFormat from "../components/PriceFormat";
import { Controller, useForm } from "react-hook-form";
import { Card, CardBody, Col, Input, Label, Row } from "reactstrap";
import Unit from "../components/public/Unit";
import BlockUi from "@availity/block-ui";

import NavbarComponent from "@src/components/NavbarComponent";
import LoadingComponent from "../components/LoadingComponent";
import Toll from "../components/public/Toll";

export default () => {
  const [params] = useSearchParams();
  const [unit, setUnit] = useState();
  const [building, setbuilding] = useState();
  const [toll, setToll] = useState();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  if (!params.has("token")) {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `public/toll/getToll?token=${params.get("token")}`
        );
        setUnit(response.data.data);
        setToll(response.data.data.toll);
        setbuilding(response.data.data.building);
      } catch (err) {
        console.log(err);
        toast.error("خطا در دریافت اطلاعات");
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      }
      setLoading(false);
    })();
    return () => {};
  }, []);

  return (
    <>
      <NavbarComponent />
      <LoadingComponent loading={loading} />
      <BlockUi tag="div" blocking={loading} renderChildren={false} message={<></>}>
        <div className="misc-wrapper">
          <div className="misc-inner p-2 p-sm-3">
            {unit && <Toll unit={unit} toll={toll} token={params.get("token")} buildingImage={building.image} />}
          </div>
        </div>
      </BlockUi>
    </>
  );
};
