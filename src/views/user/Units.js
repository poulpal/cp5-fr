import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import BlockUi from "@availity/block-ui";
import axios from "axios";
import { Button, Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Row } from "reactstrap";
import PriceFormat from "../../components/PriceFormat";
import Unit from "../../components/user/Unit";

const Units = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const response = await axios.get("user/units");
      setUnits(response.data.data.units);
    } catch (error) {
      toast.error("خطا در دریافت اطلاعات از سرور");
      console.log(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUnits();
    return () => {
      setUnits([]);
    };
  }, []);

  return (
    <>
      <BlockUi message={<></>} blocking={loading}></BlockUi>
      <h3 className="text-center mb-3">واحد ها</h3>
      <Row>
        {units.map((unit) => {
          return (
            <Col md="4" sm="6" xs="12" key={unit.id}>
              <Unit unit={unit} />
            </Col>
          );
        })}
      </Row>
    </>
  );
};

export default Units;
