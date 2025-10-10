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
import { useNavigate } from 'react-router';
import { AccountSelector } from '../../../components/buildingManager/accounting/tables/tableComponents';

const CommandButton = ({
    onExecute, icon, text, hint, color, id
}) => (
    <button
        type="button"
        className="btn btn-link"
        style={{ padding: 11 }}
        onClick={(e) => {
            onExecute();
            e.stopPropagation();
        }}
        // title={hint}
        id={id}
    >
        <span className={(color || 'undefined')}>
            {icon ? <i className={`oi oi-${icon}`} style={{ marginRight: text ? 5 : 0 }} /> : null}
            {text}
        </span>
    </button>
);

const AddButton = ({ onExecute }) => (
    <>
        <UncontrolledTooltip placement="bottom" target="add-icon">
            اضافه کردن سطر جدید
        </UncontrolledTooltip>
        <CommandButton icon="plus" id="add-icon" hint="اضافه کردن سطر جدید" onExecute={onExecute} />
    </>
);

const DeleteButton = ({ onExecute }) => (
    <>
        <UncontrolledTooltip placement="bottom" target="delete-icon">
            حذف سطر
        </UncontrolledTooltip>
        <CommandButton
            icon="trash"
            hint="حذف سطر"
            color="text-danger"
            id="delete-icon"
            onExecute={() => {
                // eslint-disable-next-line
                // if (window.confirm('Are you sure you want to delete this row?')) {
                onExecute();
                // }
            }}
        />
    </>
);


const commandComponents = {
    add: AddButton,
    delete: DeleteButton,
};

const Command = ({ id, onExecute }) => {
    const ButtonComponent = commandComponents[id];
    return (
        <ButtonComponent
            onExecute={onExecute}
        />
    );
};

export default () => {
    const navigate = useNavigate();
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
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(['noDescription', 'notBalanced']);
    const [data, setData] = useState([]);

    const refreshData = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/building_manager/accounting/accounts");
            let tempAccounts = response.data.data.accounts;
            tempAccounts = tempAccounts.sort((a, b) => a.code - b.code);
            setAccounts(tempAccounts);
            let tempDetails = response.data.data.details;
            tempDetails = tempDetails.sort((a, b) => a.code - b.code);
            setDetails(tempDetails);
            const response2 = await axios.get("/building_manager/accounting/documents/getNewDocumentNumber");
            setData({
                ...data,
                number: response2.data.data.document_number,
                date: new DateObject(),
                description: "",
                creditSum: 0,
                debitSum: 0,
            });
            setRows([{
                account: "",
                detail: "",
                description: "",
                debit: "",
                credit: "",
            }, {
                account: "",
                detail: "",
                description: "",
                debit: "",
                credit: "",
            }]);
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

    const addEmptyRow = (n = 1) => {
        let tempRows = [...rows];
        const lastDescription = tempRows[tempRows.length - 1]?.description;
        for (let i = 0; i < n; i++) {
            tempRows.push({
                account: "",
                detail: "",
                description: lastDescription,
                debit: "",
                credit: "",
            });
        }
        setRows(tempRows);
    }

    const handleFocus = (event) => {
        event.target.select();
    }

    const handleSave = async () => {
        if (errors.length > 0) return;
        setLoading(true);
        try {
            const response = await axios.post("/building_manager/accounting/documents", {
                document_number: data.number,
                date: data.date.toDate(),
                description: data.description,
                transactions: rows.map(row => ({
                    account: row.account,
                    detail: row.detail,
                    description: row.description,
                    debit: row.debit ? parseInt(row.debit) : 0,
                    credit: row.credit ? parseInt(row.credit) : 0,
                }))

            });
            toast.success(response.data.message);
            refreshData();
        } catch (err) {
            if (err.response && err.response.data.message) {
                toast.error(err.response.data.message);
            }
            if (err.response && err.response.data.errors) {
                Object.keys(err.response.data.errors).forEach((key) => {
                    toast.error(err.response.data.errors[key][0]);
                });
            }
        }
        setLoading(false);
    }



    return (
        <div className="card" style={{
            minHeight: "89vh",
        }}>
            <LoadingComponent loading={loading} />
            <h3 className="text-center mb-0 pt-1 pb-0">سند جدید</h3>
            <div className="py-1 px-2 d-flex justify-content-between align-items-center">
                <div>
                    <FontAwesomeIcon icon={faArrowRight} id="back-icon" size="lg" color="black" className="clickable" onClick={() => {
                        navigate('/buildingManager/documents');
                    }} />
                </div>
                <div>
                    {errors.length > 0 ?
                        <FontAwesomeIcon icon={faSave} id="save-icon" size="lg" color="grey" className="clickable disabled" />
                        :
                        <FontAwesomeIcon icon={faSave} id="save-icon" size="lg" color="green" className="clickable" onClick={handleSave} />
                    }
                    <UncontrolledTooltip placement="bottom" target="save-icon">
                        ذخیره سند
                    </UncontrolledTooltip>
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
                            <input type="text" className='accounting-input' value={data.description} onChange={e => {
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
                                defaultValue={new DateObject()}
                                onChange={(x) => {
                                    // if (x instanceof DateObject) x = x.toDate();
                                    setData({
                                        ...data,
                                        date: x,
                                    })
                                }}
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
                            <Command id="add" onExecute={() => addEmptyRow(1)} />
                        </th>
                        <th>حساب</th>
                        <th>تفصیل</th>
                        <th>شرح</th>
                        <th>بدهکار</th>
                        <th>بستانکار</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr key={index}>
                            <td className='p-0 text-center w-auto' >
                                {index + 1}
                            </td>
                            <td className='p-0'>
                                {/* <Select
                                    value={accounts.find((account) => account.code === row.account) ?? null}
                                    onChange={(selectedOption) => {
                                        let tempRows = [...rows];
                                        tempRows[index].account = selectedOption.code;
                                        setRows(tempRows);
                                    }}
                                    noOptionsMessage={() => "..."}
                                    placeholder="انتخاب کنید"
                                    options={accounts}
                                    getOptionLabel={(option) => option.code + " - " + option.name}
                                    getOptionValue={(option) => option.code}
                                    onFocus={handleFocus}
                                /> */}
                                <AccountSelector
                                    account={accounts.find((account) => account.code === row.account) ?? null}
                                    setAccount={selectedOption => {
                                        let tempRows = [...rows];
                                        tempRows[index].account = selectedOption.code;
                                        setRows(tempRows);
                                    }}
                                    accounts={accounts}
                                />
                            </td>
                            <td className='p-0'>
                                <AccountSelector
                                    account={details.find((detail) => detail.code === row.detail) ?? null}
                                    setAccount={selectedOption => {
                                        let tempRows = [...rows];
                                        tempRows[index].detail = selectedOption.code;
                                        setRows(tempRows);
                                    }}
                                    accounts={details}
                                    placeholder='انتخاب تفصیل'
                                />
                            </td>
                            <td>
                                <input type="text" className='table-input' value={row.description} onChange={e => {
                                    let tempRows = [...rows];
                                    tempRows[index].description = e.target.value;
                                    setRows(tempRows);
                                }}
                                    onFocus={handleFocus}
                                />
                            </td>
                            <td>
                                <NumericFormat
                                    thousandSeparator={true}
                                    className="table-input"
                                    inputMode="tel"
                                    onFocus={handleFocus}
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
                                    onFocus={handleFocus}
                                    value={Intl.NumberFormat().format(row.credit)}
                                    onChange={e => {
                                        let tempRows = [...rows];
                                        tempRows[index].credit = e.target.value.replace(/,/g, "");
                                        setRows(tempRows);
                                    }}
                                />
                            </td>
                            <td className='p-0 text-center'>
                                <Command id="delete" onExecute={() => {
                                    let tempRows = rows.filter((r, i) => i !== index);
                                    setRows(tempRows);
                                }} />
                            </td>
                        </tr>
                    ))}

                    <tr style={{
                        height: '35px',
                    }}>
                        <td>
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
                        <td>
                        </td>

                    </tr>
                </tbody>
            </Table>

        </div >
    );
};
