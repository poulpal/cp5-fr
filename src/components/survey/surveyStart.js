import { Link, useParams } from "react-router-dom";
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Row } from "reactstrap";
import CoinLogo from "@src/assets/images/logo/coin.png";

const SurveyStart = ({
    welcome_message,
    description,
    eta,
    startSurvey
}) => {
    return (
        <>
            <img
                src={CoinLogo}
                alt="ChargePal"
                className="logo"
            />
            <span className="title" dangerouslySetInnerHTML={{ __html: welcome_message.split("\r\n").join("<br>") }}>
            </span>
            <span className="description" dangerouslySetInnerHTML={{ __html: description.split("\r\n").join("<br>") }}>
            </span>

            <div className="eta-box">
            پاسخگویی به سوالات {eta} دقیقه زمان می‌برد
            </div>

            <div className="button" onClick={startSurvey}>
                شروع
            </div>
        </>
    );
};
export default SurveyStart;
