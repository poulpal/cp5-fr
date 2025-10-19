import { useEffect } from "react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Form,
  Input,
  InputGroup,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from "reactstrap";
import PriceFormat from "../../components/PriceFormat";
// ... سایر ایمپورت‌ها

const PublicUnit = ({ /* props */ }) => {
  // ... استیت‌ها و افکت‌ها

  return (
    <>
      {/* ... */}
      <Card className="text-center">
        <CardHeader>
          <h3 className="text-center w-100">شماره واحد : {unit.unit_number}</h3>
          <h5 className="text-center w-100">{unit.building.name}</h5>
          {/* ⛔️ جملهٔ "تمامی مبالغ به ریال است" حذف شد */}
        </CardHeader>
        <CardBody>
          <h6 className="d-flex flex-row justify-content-between">
            <span className="font-weight-bold">شارژ ماهیانه : </span>
            <PriceFormat price={unit.charge_fee} convertToRial />
          </h6>
          {/* ... ادامه */}
        </CardBody>
        {/* ... Footer و سایر بخش‌ها */}
      </Card>
    </>
  );
};

export default PublicUnit;
