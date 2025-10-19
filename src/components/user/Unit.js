import { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  Row,
} from "reactstrap";
import PriceFormat from "../../components/PriceFormat";
import { NumericFormat } from "react-number-format";
import BlockUi from "@availity/block-ui";
import OnlinePayModal from "./OnlinePayModal";
import ManualPayModal from "./ManualPayModal";

const Unit = ({ unit, refreshData }) => {
  const [onlinePayModal, setOnlinePayModal] = useState(false);
  const [manualPayModal, setManualPayModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [residentType, setResidentType] = useState('resident');

  const toggleOnlinePayModal = () => {
    setOnlinePayModal(!onlinePayModal);
  };

  const toggleManualPayModal = () => {
    setManualPayModal(!manualPayModal);
  };

  return (
    <>
      <BlockUi tag="div" blocking={loading} message={<></>} />
      <OnlinePayModal
        onlinePayModal={onlinePayModal}
        toggleOnlinePayModal={toggleOnlinePayModal}
        unit={unit}
        setLoading={setLoading}
        refreshData={refreshData}
        residentType={residentType}
      />
      <ManualPayModal
        setLoading={setLoading}
        manualPayModal={manualPayModal}
        toggleManualPayModal={toggleManualPayModal}
        unit={unit}
        refreshData={refreshData}
      />

      <Card className="text-center">
        <CardHeader>
          <h3 className="text-center w-100">شماره واحد : {unit.unit_number}</h3>
          <h5 className="text-center w-100">{unit.building.name}</h5>
        </CardHeader>
        <CardBody>
          <h6 className="d-flex flex-row justify-content-between">
            <span className="font-weight-bold">شارژ ماهیانه : </span>
            <PriceFormat price={unit.charge_fee} convertToRial />
          </h6>
          {/* <h6 className="d-flex flex-row justify-content-between">
            {unit.charge_debt >= 0 ? (
              <>
                <span className="font-weight-bold">مبلغ بدهی : </span>
                <span className="text-danger">
                  <PriceFormat price={unit.charge_debt} convertToRial />
                </span>
              </>
            ) : (
              <>
                <span className="font-weight-bold">موجودی : </span>
                <span className="text-success">
                  <PriceFormat price={-1 * unit.charge_debt} convertToRial />
                </span>
              </>
            )}
          </h6> */}
          {unit.separateResidentAndOwnerInvoices ? (<>
            {unit.resident_type == 'resident' && (
              <h6 className="d-flex flex-row justify-content-between">
                {unit.resident_debt >= 0 ? (
                  <>
                    <span className="font-weight-bold">مبلغ بدهی (سهم ساکن): </span>
                    <span className="text-danger">
                      <PriceFormat price={unit.resident_debt} convertToRial />
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-weight-bold">موجودی (سهم ساکن): </span>
                    <span className="text-success">
                      <PriceFormat price={-1 * unit.resident_debt} convertToRial />
                    </span>
                  </>
                )}
              </h6>
            )}
            {unit.ownership == 'owner' && (
              <h6 className="d-flex flex-row justify-content-between">
                {unit.owner_debt >= 0 ? (
                  <>
                    <span className="font-weight-bold">مبلغ بدهی (سهم مالک): </span>
                    <span className="text-danger">
                      <PriceFormat price={unit.owner_debt} convertToRial />
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-weight-bold">موجودی (سهم مالک): </span>
                    <span className="text-success">
                      <PriceFormat price={-1 * unit.owner_debt} convertToRial />
                    </span>
                  </>
                )}
              </h6>
            )}
          </>
          ) : (
            <h6 className="d-flex flex-row justify-content-between">
              {unit.charge_debt >= 0 ? (
                <>
                  <span className="font-weight-bold">مبلغ بدهی : </span>
                  <span className="text-danger">
                    <PriceFormat price={unit.charge_debt} convertToRial />
                  </span>
                </>
              ) : (
                <>
                  <span className="font-weight-bold">موجودی : </span>
                  <span className="text-success">
                    <PriceFormat price={-1 * unit.charge_debt} convertToRial />
                  </span>
                </>
              )}
            </h6>
          )}
          {unit.discount > 0 &&
            <h6 className="d-flex flex-row justify-content-between text-success">
              <span className="font-weight-bold">جایزه خوشحسابی : </span>
              <PriceFormat price={unit.discount} convertToRial />
            </h6>
          }
        </CardBody>
        <CardFooter>
          <Row>
            {unit.separateResidentAndOwnerInvoices ? (<>
              <Col md="6">
                {unit.resident_type == 'resident' && (
                  <Button
                    color="success"
                    className="w-100 mb-1"
                    onClick={() => {
                      setResidentType('resident');
                      setOnlinePayModal(true);
                    }}
                  >
                    پرداخت آنلاین بدهی (سهم ساکن)
                  </Button>
                )}
                {unit.ownership == 'owner' && (
                  <Button
                    color="success"
                    className="w-100 mb-1"
                    onClick={() => {
                      setResidentType('owner');
                      setOnlinePayModal(true);
                    }}
                  >
                    پرداخت آنلاین بدهی (سهم مالک)
                  </Button>
                )}
              </Col>
            </>
            ) : (
              <Col md="6">
                <Button
                  color="success"
                  className="w-100 mb-1"
                  onClick={() => {
                    setResidentType('resident');
                    setOnlinePayModal(true);
                  }}
                >
                  پرداخت آنلاین بدهی
                </Button>
              </Col>
            )}
            {unit.canPayManual ? (
              <>
                <Col md="6">
                  <Button
                    color="primary"
                    className="w-100 mb-1"
                    onClick={() => {
                      setManualPayModal(true);
                    }}
                  >
                    ثبت پرداخت دستی
                  </Button>
                </Col>
              </>
            ) : <Col md="3"></Col>}
          </Row>
        </CardFooter>
      </Card>
    </>
  );
};

export default Unit;