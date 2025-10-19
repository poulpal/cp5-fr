import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import BlockUi from "@availity/block-ui";
import axios from "axios";
import { Row, Col } from "reactstrap";
import Unit from "../../components/user/Unit";

const Units = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/user/units");
      const list = data?.data?.units ?? data?.data ?? [];
      setUnits(Array.isArray(list) ? list : []);
    } catch (err) {
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
    return () => setUnits([]);
  }, []);

  return (
    <>
      <BlockUi message={<></>} blocking={loading} />
      <h3 className="text-center mb-3">واحد ها</h3>
      <Row>
        {units.map((unit) => (
          <Col md="4" sm="6" xs="12" key={unit.id}>
            <Unit unit={unit} refreshData={fetchUnits} />
          </Col>
        ))}
      </Row>
    </>
  );
};

export default Units;
