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
import themeConfig from "@configs/themeConfig";

import whatsapp from "@src/assets/images/icons/whatsapp.png";
import skype from "@src/assets/images/icons/skype.png";
import meet from "@src/assets/images/icons/meet.png";
import telegram from "@src/assets/images/icons/telegram.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhoneSquare } from "@fortawesome/free-solid-svg-icons";
import { first, result } from "lodash";
import { getUserRole } from "../auth/auth";
import Units from "./buildingManager/Units";
import Debts from "./buildingManager/Debts";
import Qrcodes from "./buildingManager/Qrcodes";

const icons = [
  {
    title: "واتسپ",
    icon: whatsapp,
    link: "https://wa.me/send?phone=982191031869&text=با درود در مورد ایجاد ساختمان در شارژپل سوال داشتم.",
  },
  // {
  //   title: "اسکایپ",
  //   icon: skype,
  //   link: "https://t.me/poulpal",
  // },
  // {
  //   title: "گوگل میت",
  //   icon: meet,
  //   link: "https://t.me/poulpal",
  // },
  {
    title: "تلگرام",
    icon: telegram,
    link: "https://t.me/Chargepalir",
  },
  // {
  //   title: "تماس",
  //   icon: CallIcon,
  //   link: "tel:982191031869",
  // }
];

export default () => {
  const { slug } = useParams();
  const [loading, setLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [survey, setSurvey] = useState(null);
  const [isEnded, setIsEnded] = useState(false);

  const [results, setResults] = useState({

  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState(null);


  useEffect(() => {
    setSurvey({
      "welcome_message": "همراه گرامی شارژپل وقت شما بخیر",
      "description": "با طی کردن مراحل زیر، در 5 حرکت پنل شما به صورت اتوماتیک فعال و  آماده سازی می شود؛ چنانچه در این مسیر نیاز به راهنمایی داشتید؛ همکاران ما  آماده پاسخگویی به شما هستند",
      "end_message": "با تشکر از شما؛ اطلاعات شما با موفقیت ثبت شد",
      "eta": 5,
      "questions": [
        {
          "title": "ثبت نام",
          "type": "step",
          "step": 0
        },
        {
          "title": "ثبت نام",
          "type": "step",
          "step": 1
        },
        {
          "title": "ساکنین و مالکین ساختمان خود را ثبت کنید",
          "type": "step",
          "step": 2
        },
        {
          "title": "بدهی های قبلی را وارد کنید",
          "type": "step",
          "step": 3
        },
      ]
    })
    return () => { };
  }, []);

  const startSurvey = () => {

    const role = getUserRole();
    console.log(role);
    if (role === "buildingManager") {
      setCurrentQuestion(1);
    }
    setIsStarted(true);
  }

  const submitRegisterBuilding = async (data) => {
    setLoading(true);
    try {
      data = {
        ...data,
        type: 'building_manager',
        mobile: JSON.parse(localStorage.getItem("userData")).mobile,

      };
      const response = await axios.post("/business/register", data);
      toast.success(response.data.message);
      const newToken = response.data.data.token;
      localStorage.setItem("accessToken", newToken);
      localStorage.setItem("selectedUnit", "buildingManager");
      let userData = JSON.parse(localStorage.getItem("userData"));
      userData.role = "building_manager";
      localStorage.setItem("userData", JSON.stringify(userData));
      setCurrentQuestion(currentQuestion + 1);
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      }
      if (error.response?.data?.errors) {
        for (const [key, value] of Object.entries(error.response.data.errors)) {
          toast.error(value);
        }
      }
    }
    setLoading(false);
  };

  const goToNextQuestion = async () => {
    // setCurrentAnswer(results[currentQuestion + 1]);
    if (currentQuestion == 0) {
      return await submitRegisterBuilding(results);
    }
    setCurrentQuestion(currentQuestion + 1);
    if (currentQuestion == survey.questions.length - 1) {
      setIsEnded(true);
    }
    // setResults({ ...results, [currentQuestion]: currentAnswer });
  }

  const goToPreviousQuestion = () => {
    // setCurrentAnswer(results[currentQuestion - 1]);
    if (currentQuestion - 1 >= 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  }

  if (isEnded && survey) {
    return (
      <div className="survey">
        <div className="card survey-card">
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
                (<>
                  {survey.questions[currentQuestion].step == 0 && <WizardStepOne results={results} setResults={setResults} setCurrentAnswer={setCurrentAnswer} />}
                  {survey.questions[currentQuestion].step == 1 && <WizardStepTwo currentAnswer={currentAnswer} setCurrentAnswer={setCurrentAnswer} />}
                  {survey.questions[currentQuestion].step == 2 && <WizardStepThree currentAnswer={currentAnswer} setCurrentAnswer={setCurrentAnswer} />}
                  {survey.questions[currentQuestion].step == 3 && <WizardStepFour currentAnswer={currentAnswer} setCurrentAnswer={setCurrentAnswer} />}
                </>
                ) :
                (<>
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
                <div className={"button progress-button left" + (currentQuestion <= 1 ? " disabled" : "")} onClick={() => {
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
        </div >
      )
      }
    </>
  );
};

const WizardStepOne = ({ results, setResults, setCurrentAnswer }) => {
  useEffect(() => {
    // if all questions are not null
    if (results.first_name && results.last_name && results.building_name && results.building_name_en && results.unit_count && results.city && results.address && results.email) {
      setCurrentAnswer(' ');
    }
    return () => { };
  }, [results]);


  return (
    <>
      <Question results={results} setResults={setResults} name="first_name" label="نام" autoFocus />
      <Question results={results} setResults={setResults} name="last_name" label="نام خانوادگی" />
      <Question results={results} setResults={setResults} name="building_name" label="نام ساختمان" />
      <Question results={results} setResults={setResults} name="building_name_en" label="نام انگلیسی ساختمان" />
      <Question results={results} setResults={setResults} name="unit_count" label="تعداد واحد ها" />
      <Question results={results} setResults={setResults} name="city" label="شهر" />
      <Question results={results} setResults={setResults} name="address" label="آدرس" />
      <Question results={results} setResults={setResults} name="email" label="ایمیل" />
    </>
  );
}

const WizardStepTwo = ({ results, setResults, currentAnswer, setCurrentAnswer }) => {
  return (
    <>
      <SurveyQuestion question={{
        "title": "نوع ساختمان خود را مشخص نمایید",
        "type": "radio",
        "options": [
          "مسکونی",
          "تجاری",
          "اداری",
          "شهرک"
        ],
        "has_other": false
      }}
        setCurrentAnswer={setCurrentAnswer}
        answer={currentAnswer}
      />
    </>
  );
}

const WizardStepThree = ({ results, setResults, currentAnswer, setCurrentAnswer }) => {
  return (
    <div>
      <div className="question" style={{ marginBottom: '10px' }}>
        <div className="title" style={{ marginBottom: '5px' }}>ساکنین و مالکین ساختمان خود را ثبت کنید</div>
        <div className="title" style={{ marginBottom: '5px', fontSize: '12px' }}>* چنانچه تمایل داشته باشید برای سرعت بخشیدن به این عملیات می توانید از طریق کلید زیر فایل اکسل اطلاعات ساکنین را برای ما ارسال نمایید</div>
        <Units />
      </div>
    </div>
  );
}

const WizardStepFour = ({ results, setResults, currentAnswer, setCurrentAnswer }) => {
  return (
    <div>
      <div className="question" style={{ marginBottom: '10px' }}>
        <div className="title" style={{ marginBottom: '5px' }}>بدهی های قبلی را وارد کنید</div>
        <Debts />
      </div>
    </div>
  );
}

const SurveyEnd = ({
  end_message
}) => {
  return (
    <>
      <span className="description text-center">
        <strong>
          تبریک
        </strong>
        <p>
          به خانواده شارژپل خوش آمدید
        </p>
      </span>
      <Qrcodes />
      <Link to={'/'}>
        <div className="button" >
          بازگشت به صفحه اصلی
        </div>
      </Link>
    </>
  );
};

const Question = ({ results, setResults, name, label, autoFocus = false }) => {
  return (
    <div className="question" style={{ marginBottom: '10px' }}>
      <div className="title" style={{ marginBottom: '5px' }}>{label}</div>
      <div className="other">
        <input type="text" placeholder="محل درج پاسخ ..."
          className={"survey-input"}
          autoFocus={autoFocus}
          value={results[name] || ""}
          inputMode={"text"}
          onChange={(e) => {
            setResults({ ...results, [name]: e.target.value });
          }}
        />
      </div>
    </div>
  );
}