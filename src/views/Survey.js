import { Link, useParams } from "react-router-dom";
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Row } from "reactstrap";

import "../scss/survey.scss";
import PriceFormat from "../components/PriceFormat";
import NavbarComponent from "../components/NavbarComponent";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import Avatar from "@components/Avatar";
import LoadingComponent from "../components/LoadingComponent";
import SurveyStart from "../components/survey/surveyStart";
import SurveyQuestion from "../components/survey/surveyQuestion";
import ProgressBar from "@ramonak/react-progress-bar";
import SurveyEnd from "../components/survey/surveyEnd";
import themeConfig from "@configs/themeConfig";

const Survey = () => {
  const { slug } = useParams();
  const [loading, setLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [survey, setSurvey] = useState(null);
  const [isEnded, setIsEnded] = useState(false);

  const [results, setResults] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState(null);


  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `public/survey/${slug}`
        );
        setSurvey(response.data.data.survey);
        console.log(response.data.data.survey);
      } catch (err) {
        toast.error("خطا در دریافت اطلاعات");
        setTimeout(() => {
          window.location.href = import.meta.env.VITE_LANDING_URL;
        }, 1000);
      }
      setLoading(false);
    })();
    return () => { };
  }, []);

  const startSurvey = () => {
    setIsStarted(true);
  }

  const submitSurvey = (data) => {
    (async () => {
      setLoading(true);
      try {
        const response = await axios.post(`public/survey/${slug}`, data);
        toast.success("اطلاعات با موفقیت ثبت شد");
        setIsEnded(true);
      } catch (err) {
        toast.error("خطا در ارسال اطلاعات");
      }
      setLoading(false);
    })();
  }

  const goToNextQuestion = () => {
    setCurrentAnswer(results[currentQuestion + 1]);
    setCurrentQuestion(currentQuestion + 1);
    setResults({ ...results, [currentQuestion]: currentAnswer });
  }

  const goToPreviousQuestion = () => {
    setCurrentAnswer(results[currentQuestion - 1]);
    if (currentQuestion - 1 >= 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  }

  if (isEnded && survey) {
    return (
      <div className="survey">
        <div className="card">
          <SurveyEnd end_message={survey.end_message} />
        </div>
      </div>
    );
  }

  return (
    <>
      <NavbarComponent centerNavbarBrand={true} />
      <LoadingComponent isLoading={loading} />
      {survey && (
        <div className="survey">
          <div className="card survey-card">
            {isStarted ? <>

              {!(currentQuestion == survey.questions.length) ?
                (<SurveyQuestion question={survey.questions[currentQuestion]} setCurrentAnswer={setCurrentAnswer} answer={results[currentQuestion]} goToNextQuestion={goToNextQuestion} />) :
                (<>
                  <SurveyQuestion question={survey.questions[currentQuestion - 1]} setCurrentAnswer={() => { }} answer={results[currentQuestion - 1]} isDisabled={true} />
                  <div className="w-100 d-flex justify-content-center">
                    <div className="button" onClick={() => {
                      submitSurvey(results);
                    }}>
                      ارسال
                    </div>
                  </div>
                </>)}


              <div className="w-100 mt-5 d-flex justify-content-center">
                <div className={"button progress-button right" + ((currentAnswer == null || currentAnswer == [] || currentQuestion == survey.questions.length) ? " disabled" : "")} onClick={() => {
                  if ((currentAnswer == null || currentAnswer == [])) return;
                  goToNextQuestion();
                }}>
                  <span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <path d="M10.5 21L17.5 14L10.5 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    {/* {(currentQuestion + 1 == survey.questions.length) ? "ارسال" : "بعدی"} */}
                    بعدی
                  </span>
                </div>
                <div className="w-100 mx-2 d-flex flex-column align-items-center">
                  <span>
                    %{Math.round(currentQuestion / survey.questions.length * 100)} را پاسخ داده اید
                  </span>
                  <div className="w-100">
                    <ProgressBar
                      completed={currentQuestion / survey.questions.length * 100}
                      bgColor={themeConfig.layout.primaryColor}
                      height="12px"
                      labelAlignment="outside"
                      isLabelVisible={false}
                      baseBgColor="#D9D9D9"
                      labelColor="#e80909"
                      dir="rtl"
                      width="100%"
                    />
                  </div>
                </div>
                <div className={"button progress-button left" + (currentQuestion == 0 ? " disabled" : "")} onClick={() => {
                  if (currentQuestion == 0) {
                    return;
                  }
                  goToPreviousQuestion()
                }}>
                  <span>
                    قبلی
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <path d="M17.5 7L10.5 14L17.5 21" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>
            </> : <SurveyStart welcome_message={survey.welcome_message} description={survey.description} eta={survey.eta} startSurvey={startSurvey} />}

          </div>
        </div>
      )}
    </>
  );
};
export default Survey;
