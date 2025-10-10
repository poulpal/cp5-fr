import { Controller, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import {
    Button,
    Col,
    Form,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalHeader,
    Nav,
    NavItem,
    NavLink,
    Row,
    TabContent,
    TabPane,
} from "reactstrap";
import axios from "axios";
import classnames from "classnames";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import SetChargeWithExcel from "./SetChargeWithExcel";
import Select from "react-select";
import themeConfig from "@configs/themeConfig";

const variables = [
    {
        name: "مساحت",
        value: "{area}",
    },
    {
        name: "تعداد نفرات",
        value: "{resident_count}",
    },
];

export default ({
    showModal,
    setShowModal,
    setLoading,
    refreshData,
    units
}) => {
    const {
        handleSubmit: handleSubmit,
        reset: reset,
        formState: { errors },
        control: control,
        setError: setError,
    } = useForm();

    const [activeTab, setActiveTab] = useState("formula");
    const [selectType, setSelectType] = useState("all");
    const [divideType, setDivideType] = useState("equal");
    const [amount, setAmount] = useState(0);
    const [charges, setCharges] = useState([]);
    const [selectedUnits, setSelectedUnits] = useState([]);
    const [customFormula, setCustomFormula] = useState('');

    const currency = localStorage.getItem("currency");

    useEffect(() => {
        if (selectType == 'all') {
            setSelectedUnits(units);
        }
        if (selectType == 'select') {
            setSelectedUnits([]);
        }
    }, [selectType, units]);

    useEffect(() => {
        const tempDebts = selectedUnits.map((unit) => {
            let _amount = 0;
            switch (divideType) {
                case 'each':
                    _amount = amount;
                    break;
                case 'equal':
                    _amount = Math.round(amount / selectedUnits.length);
                    break;
                case 'per_area':
                    _amount = parseInt(amount) * parseFloat(unit.area);
                    break;
                case 'per_resident_count':
                    _amount = parseInt(amount) * parseInt(unit.resident_count);
                    break;
                case 'custom_formula':
                    try {
                        const exp = customFormula.replace(/{area}/g, unit.area).replace(/{resident_count}/g, unit.resident_count);
                        _amount = eval(exp);
                    } catch (error) {
                        console.error("Error evaluating custom formula:", error);
                        _amount = 0;
                    }
                    break;
                default:
                    _amount = 0;
                    break;
            }
            return {
                unit_number: unit.unit_number,
                amount: _amount || 0,
            };
        });
        setCharges(tempDebts);
    }, [selectedUnits, amount, divideType, customFormula]);

    const onSubmit = async (formData) => {
        setLoading(true);
        try {
            const response = await axios.post("/building_manager/units/setMultipleChargeFee", {
                charges: charges.map((item) => {
                    return {
                        unit_number: item.unit_number,
                        amount: item.amount / (currency === 'rial' ? 10 : 1),
                    };
                }),
            });

            toast.success(response.data.message);
            setShowModal(false);
            refreshData();
            addUnitReset();
        } catch (err) {
            if (err.response && err.response.data.message) {
                toast.error(err.response.data.message);
            }
            if (err.response && err.response.data.errors) {
                Object.keys(err.response.data.errors).forEach((key) => {
                    setError(key, err.response.data.errors[key][0]);
                });
            }
            console.log(err);
        }

        setLoading(false);
    };
    return (
        <Modal
            isOpen={showModal}
            centered={true}
            size="lg"
            toggle={() => setShowModal(false)}
        >
            <ModalHeader toggle={() => setShowModal(false)}>
                تنظیم شارژ واحد ها
            </ModalHeader>
            <ModalBody>
                <Nav pills justified>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: activeTab === "formula" })}
                            onClick={() => {
                                setActiveTab("formula");
                            }}
                        >
                            تنظیم شارژ با فرمول
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: activeTab === "multiple" })}
                            onClick={() => {
                                setActiveTab("multiple");
                            }}
                        >
                            تنظیم شارژ گروهی
                        </NavLink>
                    </NavItem>
                </Nav>
                <TabContent activeTab={activeTab}>
                    <TabPane tabId="formula">
                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <div className="mb-2">
                                <Label>واحد ها</Label>
                                <select
                                    className="form-control"
                                    value={selectType}
                                    onChange={(e) => setSelectType(e.target.value)}
                                >
                                    <option value='all'>همه واحد ها</option>
                                    <option value='select'>انتخاب واحد ها</option>
                                    {/* <option value='debt_mt'>واحد ها با بدهی بیشتر از</option> */}
                                </select>
                            </div>
                            {selectType == 'select' && (
                                <div className="mb-2">
                                    <Label>واحد ها</Label>
                                    <Select
                                        styles={{
                                            control: (baseStyles, state) => ({
                                                ...baseStyles,
                                                border: "1px solid" + themeConfig.layout.primaryColor,
                                                borderColor: themeConfig.layout.primaryColor,
                                                height: "48px",
                                                borderRadius: "20px",
                                                boxShadow: state.isFocused
                                                    ? "0 3px 10px 0 rgba(34, 41, 47, 0.1)"
                                                    : "unset",
                                            }),
                                        }}
                                        noOptionsMessage={() => "..."}
                                        placeholder="انتخاب کنید"
                                        value={selectedUnits}
                                        onChange={(selected) => {
                                            setSelectedUnits(selected);
                                        }}
                                        isClearable={true}
                                        isMulti={true}
                                        options={units}
                                        getOptionLabel={(option) => 'واحد ' + option.unit_number}
                                        getOptionValue={(option) => option.id}
                                    />
                                </div>
                            )}
                            {selectType == 'debt_mt' && (
                                <div className="mb-2">
                                    <NumericFormat
                                        value={debt}
                                        onValueChange={(values) => {
                                            const { formattedValue, value } = values;
                                            setDebt(formattedValue);
                                        }}
                                        thousandSeparator={true}
                                        className="form-control"
                                        placeholder="شارژ ماهیانه (تومان)"
                                        inputMode="tel"
                                    />
                                </div>
                            )}
                            <div className="mb-2">
                                <Label>تقسیم</Label>
                                <select
                                    className="form-control"
                                    value={divideType}
                                    onChange={(e) => setDivideType(e.target.value)}
                                >
                                    <option value='equal'>مساوی بین واحد ها</option>
                                    <option value='each'>به ازای هر واحد</option>
                                    <option value='per_area'>بر حسب متراژ</option>
                                    <option value='per_resident_count'>بر حسب تعداد نفرات</option>
                                    <option value='custom_formula'>فرمول دلخواه</option>
                                </select>
                            </div>
                            <Row>
                                {divideType !== 'custom_formula' ? (
                                    <Col md={12}>
                                        <div className="mt-1">
                                            {currency === 'rial' ?
                                                <Label>شارژ ماهیانه (ریال) *</Label>
                                                :
                                                <Label>شارژ ماهیانه (تومان) *</Label>
                                            }
                                            <Controller
                                                name="amount"
                                                control={control}
                                                defaultValue=""
                                                render={({ field }) => (
                                                    <NumericFormat
                                                        onChange={(e) => {
                                                            setAmount(e.target.value.replace(/,/g, ""));
                                                        }}
                                                        thousandSeparator={true}
                                                        className="form-control"
                                                        placeholder="شارژ ماهیانه"
                                                        inputMode="tel"
                                                    />
                                                )}
                                            />
                                            {errors.amount && (
                                                <div className="text-danger">شارژ ماهیانه را وارد کنید</div>
                                            )}
                                        </div>
                                    </Col>
                                ) : (

                                    <Col md={12}>
                                        <div className="mt-1 mb-1">
                                            <Label>فرمول دلخواه *</Label>
                                            <Input
                                                type="text"
                                                className="form-control"
                                                style={{
                                                    direction: "ltr",
                                                    textAlign: "left",
                                                    fontFamily: "monospace",
                                                }}
                                                value={customFormula}
                                                onChange={(e) => setCustomFormula(e.target.value)}
                                            />
                                        </div>
                                        {variables.map((variable, index) => (
                                            <Button
                                                key={index}
                                                color="secondary"
                                                size="sm"
                                                className="me-1 mb-1"
                                                onClick={() => {
                                                    setCustomFormula(customFormula + variable.value + " ");
                                                    const textarea = document.querySelector("textarea");
                                                    textarea.focus();
                                                }}
                                            >
                                                {variable.name}
                                            </Button>
                                        ))}
                                    </Col>
                                )}
                            </Row>
                            <hr />
                            <div style={{
                                maxHeight: '300px',
                                overflowY: 'auto',
                                overflowX: 'hidden',
                            }}>
                                {charges.map((item, index) => (
                                    <div key={index}>
                                        <Row>
                                            <Col sm="6">
                                                <Label for="unit_number">شماره واحد</Label>
                                                <input
                                                    name="unit_number"
                                                    type="text"
                                                    className="form-control"
                                                    disabled={true}
                                                    value={item.unit_number}
                                                />
                                            </Col>
                                            <Col sm="6">
                                                <Label for="monthly_charge">شارژ ماهیانه</Label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    disabled={true}
                                                    value={item.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-1 d-flex justify-content-center w-100">
                                <Button
                                    color="primary"
                                    type="submit"
                                    style={{
                                        minWidth: "150px",
                                    }}
                                >
                                    ثبت
                                </Button>
                            </div>
                        </Form>
                    </TabPane>

                    <TabPane tabId="multiple">
                        <SetChargeWithExcel
                            setLoading={setLoading}
                            refreshData={refreshData}
                            toggleModal={() => setShowModal(!showModal)}
                            units={units}
                        />
                    </TabPane>
                </TabContent>
            </ModalBody>
        </Modal>
    );
};

