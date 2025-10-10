import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LoadingComponent from '../../../components/LoadingComponent';
import Select from 'react-select';
import { Col, Input, Label, Row, Table, UncontrolledTooltip } from 'reactstrap';
import { NumericFormat } from 'react-number-format';
import PriceFormat from '../../../components/PriceFormat';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-regular-svg-icons';
import toast from 'react-hot-toast';


import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useParams } from 'react-router';


export default () => {
    const navigate = useNavigate();
    const { number } = useParams();
    const [columns] = useState([
        {
            name: 'account',
            title: 'حساب',
        },
        {
            name: 'description',
            title: 'شرح',
        },
        {
            name: 'debit',
            title: 'بدهکار',
        },
        {
            name: 'credit',
            title: 'بستانکار',
        },
    ]);
    const [rows, setRows] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [data, setData] = useState([]);

    const refreshData = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/building_manager/accounting/documents/" + number);
            setData({
                ...data,
                number: response.data.data.document.document_number,
                date: new DateObject(response.data.data.document.created_at),
                description: response.data.data.document.description,
                creditSum: 0,
                debitSum: 0,
            });
            setRows(response.data.data.document.transactions.map(transaction => ({
                account: transaction.account.code + " - " + transaction.account.name,
                detail: transaction.detail ? transaction.detail.code + " - " + transaction.detail.name : "",
                description: transaction.description,
                debit: transaction.debit,
                credit: transaction.credit,
            })));
        } catch (err) {
            if (err.response && err.response.data.message) {
                toast.error(err.response.data.message);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        refreshData();
    }, []);

    useEffect(() => {
        const creditSum = rows.reduce((acc, row) => acc + (row.credit ? parseInt(row.credit) : 0), 0);
        const debitSum = rows.reduce((acc, row) => acc + (row.debit ? parseInt(row.debit) : 0), 0);

        setData({
            ...data,
            creditSum,
            debitSum,
        })

        if (creditSum === 0 || debitSum === 0 || creditSum !== debitSum) {
            setErrors([...errors, 'notBalanced']);
        } else {
            setErrors(errors.filter(e => e !== 'notBalanced'));
        }
    }, [rows]);

    useEffect(() => {
        if (!data.description) {
            setErrors([...errors, 'noDescription']);
        } else {
            setErrors(errors.filter(e => e !== 'noDescription'));
        }
    }, [data]);

    return (
        <div className="card" style={{
            minHeight: "89vh",
        }}>
            <LoadingComponent loading={loading} />
            <div className="py-1 px-2 d-flex justify-content-between align-items-center">
                <div>
                    <FontAwesomeIcon icon={faArrowRight} id="back-icon" size="lg" color="black" className="clickable" onClick={() => {
                        navigate('/buildingManager/documents');
                    }} />
                </div>
                <h3 className="text-center mb-2 pt-1 pb-0">سند {number}</h3>
                <div>
                    <UncontrolledTooltip placement="bottom" target="back-icon">
                        بازگشت به اسناد
                    </UncontrolledTooltip>
                </div>
            </div>
            <div className="pb-1 px-2">
                <Row>
                    <Col md="8">
                        <div className='d-flex flex-column'>
                            <Label>شرح سند</Label>
                            <input type="text" className='accounting-input' readOnly value={data.description} onChange={e => {
                                setData({
                                    ...data,
                                    description: e.target.value,
                                })
                            }} />
                        </div>
                    </Col>
                    <Col md="2">
                        <div className='d-flex flex-column'>
                            <Label>شماره</Label>
                            <input type="text" className='accounting-input' disabled value={data.number} style={{
                                direction: 'ltr',
                            }} />
                        </div>
                    </Col>
                    <Col md="2">
                        <div className='d-flex flex-column'>
                            <Label>تاریخ</Label>
                            <DatePicker
                                format="YYYY/MM/DD"
                                value={data.date}
                                defaultValue={data.date}
                                onChange={(x) => {
                                    // if (x instanceof DateObject) x = x.toDate();
                                    setData({
                                        ...data,
                                        date: x,
                                    })
                                }}
                                readOnly
                                calendar={persian}
                                locale={persian_fa}
                                calendarPosition="bottom-right"
                                inputClass="accounting-input"
                                maxDate={new DateObject()}
                            />
                        </div>
                    </Col>
                </Row>


            </div>
            <Table className='table-bordered table-document' size='sm'>
                <thead>
                    <tr>
                        <th style={{
                            width: '25px'
                        }}>
                        </th>
                        <th>حساب</th>
                        <th>تفضیل</th>
                        <th>شرح</th>
                        <th>بدهکار</th>
                        <th>بستانکار</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr key={index}>
                            <td className='p-0 text-center w-auto' >
                                {index + 1}
                            </td>
                            <td>
                                <input type="text" className='table-input' readOnly value={row.account} />
                            </td>
                            <td>
                                <input type="text" className='table-input' readOnly value={row.detail} />
                            </td>
                            <td>
                                <input type="text" className='table-input' readOnly value={row.description} onChange={e => {
                                    let tempRows = [...rows];
                                    tempRows[index].description = e.target.value;
                                    setRows(tempRows);
                                }}
                                />
                            </td>
                            <td>
                                <NumericFormat
                                    thousandSeparator={true}
                                    className="table-input"
                                    inputMode="tel"
                                    readOnly
                                    value={Intl.NumberFormat().format(row.debit)}
                                    onChange={e => {
                                        let tempRows = [...rows];
                                        tempRows[index].debit = e.target.value.replace(/,/g, "");
                                        setRows(tempRows);
                                    }}
                                />
                            </td>
                            <td>
                                <NumericFormat
                                    thousandSeparator={true}
                                    className="table-input"
                                    inputMode="tel"
                                    readOnly
                                    value={Intl.NumberFormat().format(row.credit)}
                                    onChange={e => {
                                        let tempRows = [...rows];
                                        tempRows[index].credit = e.target.value.replace(/,/g, "");
                                        setRows(tempRows);
                                    }}
                                />
                            </td>
                        </tr>
                    ))}

                    <tr style={{
                        height: '35px',
                    }}>
                        <td>
                            -
                        </td>
                        <td>
                        </td>
                        <td>
                        </td>
                        <td>
                        </td>
                        <td className={errors.includes('notBalanced') ? 'text-danger' : 'text-muted'} >
                            <PriceFormat price={data.debitSum} showCurrency={false} />
                        </td>
                        <td className={errors.includes('notBalanced') ? 'text-danger' : 'text-muted'} >
                            <PriceFormat price={data.creditSum} showCurrency={false} />
                        </td>

                    </tr>
                </tbody>
            </Table>

        </div >
    );
};
