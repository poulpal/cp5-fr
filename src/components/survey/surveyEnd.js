import { Link, useParams } from "react-router-dom";
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Row } from "reactstrap";
import EndLogo from "@src/assets/images/SurveyEnd.svg";

const SurveyEnd = ({
    end_message
}) => {
    return (
        <>
            <img
                src={EndLogo}
                alt="ChargePal"
                className="end-logo"
            />
            <span className="description text-center" dangerouslySetInnerHTML={{ __html: end_message.split("\r\n").join("<br>") }}>
            </span>
            <Link to={import.meta.env.VITE_LANDING_URL}>
                <div className="button" >
                    بازگشت به صفحه اصلی
                </div>
            </Link>
        </>
    );
};
export default SurveyEnd;
