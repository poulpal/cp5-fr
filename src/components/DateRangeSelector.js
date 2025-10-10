import { Controller, useForm } from "react-hook-form";
import {
    Label,
} from "reactstrap";


import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import InputIcon from "react-multi-date-picker/components/input_icon"
import moment from "moment-jalaali";
import { useEffect, useState } from "react";

const DateRangeSelector = ({ setStart, setEnd, accountingStyle = false }) => {
    const thisYearStart = moment().startOf("jYear");

    const [s, setS] = useState(thisYearStart.toDate());
    const [e, setE] = useState(moment().toDate());

    useEffect(() => {
        setStart(thisYearStart.toDate().toISOString());
        setEnd(moment().toDate().toISOString());
    }, []);

    return (
        <DatePicker
            range
            rangeHover
            value={[s, e]}
            format="YYYY/MM/DD"
            dateSeparator=" تا "
            onChange={(date) => {
                if (date[0] && date[1]) {
                    // console.log(moment(date[0].toDate()).format("jYYYY/jMM/jDD"));
                    // console.log(moment(date[1].toDate()).format("jYYYY/jMM/jDD"));
                    setStart(moment(date[0].toDate()).format("YYYY-MM-DD"));
                    setEnd(moment(date[1].toDate()).format("YYYY-MM-DD"));
                    setS(date[0].toDate());
                    setE(date[1].toDate());
                }
            }}
            calendar={persian}
            locale={persian_fa}
            calendarPosition="bottom-right"
            // inputClass="form-control ms-1"
            inputClass={!accountingStyle ? "form-control ms-1" : "accounting-input"}
            style={!accountingStyle ? {
                maxWidth: "200px",
                width: "100%",
                height: "30px",
            } : {
                marginLeft: "10px"
            }}
            maxDate={new DateObject()}
        />
    );
};

export default DateRangeSelector;
