import { Link, useParams } from "react-router-dom";
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Row } from "reactstrap";
import CoinLogo from "@src/assets/images/logo/coin.png";
import { useEffect, useState } from "react";
import { set } from "lodash";

const SurveyQuestion = ({
    question,
    setCurrentAnswer,
    answer,
    isDisabled = false,
    goToNextQuestion
}) => {
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [otherText, setOtherText] = useState("");
    const [text, setText] = useState("");
    const [textError, setTextError] = useState(null);

    useEffect(() => {
        if (answer) {
            console.log(answer);
            if (question.type === "radio") {
                setSelectedOptions([answer]);
                if (question.has_other && !question.options.includes(answer)) {
                    setOtherText(answer);
                    setSelectedOptions(["other"]);
                }
            }
            if (question.type === "checkbox") {
                setSelectedOptions(answer);
            }
            if (question.type === "text") {
                setText(answer);
            }
        }
        return () => {
            setSelectedOptions([]);
            setOtherText("");
            setText("");
        };
    }, [question]);



    const selectOption = (option) => {
        if (question.type === "radio") {
            if (selectedOptions.includes(option)) {
                setSelectedOptions(selectedOptions.filter((item) => item !== option));
            }
            else {
                setSelectedOptions([option]);
            }
            if (option === "other") {
                setCurrentAnswer(otherText);
            } else {
                setCurrentAnswer(option);
            }

        }
        if (question.type === "checkbox") {
            if (selectedOptions.includes(option)) {
                setSelectedOptions(selectedOptions.filter((item) => item !== option));
                setCurrentAnswer(selectedOptions.filter((item) => item !== option));
            }
            else {
                setSelectedOptions([...selectedOptions, option]);
                setCurrentAnswer([...selectedOptions, option]);
            }
        }

    }
    return (
        <>
            <div className="question" style={{
                opacity: isDisabled ? 0.2 : 1,
                pointerEvents: isDisabled ? "none" : "auto",
            }}>
                <div className="title" dangerouslySetInnerHTML={{ __html: question.title.split("\r\n").join("<br>") }}>
                </div>
                {question.type === "radio" && (
                    <div className="options">
                        {question.options.map((option, index) => (
                            <div key={index} onClick={() => { selectOption(option); }} className={selectedOptions.includes(option) ? "option selected" : "option"}>
                                <div className="radio"></div>
                                <span className="number">
                                    {index + 1}
                                </span>
                                <span className="option-title" dangerouslySetInnerHTML={{ __html: option.split("\r\n").join("<br>") }}>
                                </span>
                            </div>
                        ))}
                        {question.has_other && (
                            <div onClick={() => selectOption("other")} className={selectedOptions.includes("other") ? "option selected" : "option"}>
                                <div className="radio"></div>
                                <span className="number">
                                    {question.options.length + 1}
                                </span>
                                <span className="option-title">
                                    سایر
                                </span>
                            </div>
                        )}
                        {selectedOptions.includes("other") && (
                            <div className="other">
                                <input type="text" placeholder="سایر" className="survey-input"
                                    value={otherText}
                                    autoFocus
                                    onChange={(e) => {
                                        setOtherText(e.target.value)
                                        if (selectedOptions.includes("other")) {
                                            setCurrentAnswer(e.target.value);
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (otherText == "" || otherText == null) {
                                            setTextError("لطفا پاسخ خود را وارد کنید");
                                            return;
                                        }
                                        if (e.key === "Enter") {
                                            goToNextQuestion();
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )}
                {question.type === "checkbox" && (
                    <div className="options">
                        {question.options.map((option, index) => (
                            <div key={index} onClick={() => selectOption(option)} className={selectedOptions.includes(option) ? "option selected" : "option"}>
                                <div className="radio"></div>
                                <span className="number">
                                    {index + 1}
                                </span>
                                <span className="option-title" dangerouslySetInnerHTML={{ __html: option.split("\r\n").join("<br>") }}>
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {question.type === "text" && (
                    <div className="other">
                        <input type="text" placeholder="محل درج پاسخ ..."
                            className={"survey-input" + (textError !== null ? " hasError" : "")}
                            value={text}
                            autoFocus
                            inputMode={(question.validation === "number" || question.validation === "mobile") ? "tel" : "text"}
                            onChange={(e) => {
                                setTextError(null);
                                if (question.validation) {
                                    if (question.validation === "number") {
                                        if (isNaN(e.target.value)) {
                                            return;
                                        }
                                    }
                                    if (question.validation == "mobile") {
                                        if (e.target.value.length > 11) {
                                            return;
                                        }
                                        if (isNaN(e.target.value)) {
                                            return;
                                        }
                                    }
                                }
                                setText(e.target.value);
                                if (question.validation) {
                                    if (question.validation == "mobile") {
                                        if (e.target.value.length < 11) {
                                            setCurrentAnswer(null);
                                            setTextError("لطفا یک شماره موبایل معتبر وارد کنید");
                                            return;
                                        }
                                    }
                                }
                                setCurrentAnswer(e.target.value);
                            }}
                            onKeyDown={(e) => {
                                setTextError(null);
                                if (question.validation) {
                                    if (question.validation === "number") {
                                        if (isNaN(e.target.value)) {
                                            return;
                                        }
                                    }
                                    if (question.validation == "mobile") {
                                        if (e.target.value.length > 11) {
                                            return;
                                        }
                                        if (isNaN(e.target.value)) {
                                            return;
                                        }
                                    }
                                }
                                if (question.validation) {
                                    if (question.validation == "mobile") {
                                        if (e.target.value.length < 11) {
                                            setCurrentAnswer(null);
                                            setTextError("لطفا یک شماره موبایل معتبر وارد کنید");
                                            return;
                                        }
                                    }
                                }
                                if (text == "" || text == null) {
                                    setTextError("لطفا پاسخ خود را وارد کنید");
                                    return;
                                }
                                if (e.key === "Enter") {
                                    goToNextQuestion();
                                }
                            }}
                        />
                        {textError && (
                            <div className="input-error">
                                {textError}
                            </div>
                        )}
                    </div>
                )}
                {question.type === "textarea" && (
                    <div className="other">
                        <textarea placeholder="محل درج پاسخ ..."
                            className="survey-input"
                            value={text}
                            autoFocus
                            onChange={(e) => {
                                setText(e.target.value);
                                setCurrentAnswer(e.target.value);
                            }}
                            onKeyDown={(e) => {
                                setTextError(null);
                                if (text == "" || text == null) {
                                    setTextError("لطفا پاسخ خود را وارد کنید");
                                    return;
                                }
                                if (e.key === "Enter") {
                                    goToNextQuestion();
                                }
                            }}
                        />
                    </div>
                )}
                {/* <div className="button">
                    تایید
                </div> */}
            </div>
        </>
    );
};
export default SurveyQuestion;
