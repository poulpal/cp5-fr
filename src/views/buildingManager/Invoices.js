import {
  Button,
  Card,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  ListGroup,
  ListGroupItem,
  ListGroupItemHeading,
  ListGroupItemText,
  Nav,
  NavItem,
  NavLink,
  Row,
  UncontrolledDropdown,
} from "reactstrap";
import BlockUi from "@availity/block-ui";
import { useEffect, useState } from "react";
import PerfectScrollbar from "react-perfect-scrollbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faBackward,
  faHome,
  faPencil,
  faSpinner,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import PriceFormat from "../../components/PriceFormat";
import { useMediaQuery } from "react-responsive";
import { toast } from "react-hot-toast";
import moment from "moment-jalaali";
import InfiniteScroll from "react-infinite-scroller";
import ExportToExcel from "@src/components/ExportToExcel";
import Swal from "sweetalert2/dist/sweetalert2.all.js";
import withReactContent from "sweetalert2-react-content";
import "@styles/base/plugins/extensions/ext-component-sweet-alerts.scss";
import EditDepositModal from "../../components/buildingManager/EditDepositModal";
import EditDebtModal from "../../components/buildingManager/EditDebtModal";
import DateRangeSelector from "../../components/DateRangeSelector";
import classnames from "classnames";
import apiConfig from "../../configs/apiConfig";
import { isNative } from "../../utility/Utils";

const Invoices = () => {
  const [loading, setLoading] = useState(false);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [building, setBuilding] = useState({});
  const [units, setUnits] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [invoicesHasMore, setInvoicesHasMore] = useState(false);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [excelData, setExcelData] = useState([]);

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editDepositModal, setEditDepositModal] = useState(false);
  const [editDebtModal, setEditDebtModal] = useState(false);
  const [residentType, setResidentType] = useState("all");
  const [buildingOptions, setBuildingOptions] = useState({
    separate_resident_and_owner_invoices: 0,
  });

  const ismobile = useMediaQuery({ query: "(max-width: 767px)" });
  const MySwal = withReactContent(Swal);

  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");

  const currency = localStorage.getItem("currency");

  useEffect(() => {
    handleSelectUnit(selectedUnit);
  }, [rangeStart, rangeEnd, residentType]);

  const getUnits = async () => {
    setLoading(true);
    try {
      const [unitsResponse, optionsResponse] = await Promise.all([
        axios.get("/building_manager/units"),
        axios.get("/building_manager/options")
      ]);
      setUnits(unitsResponse.data.data.units);
      setFilteredUnits(unitsResponse.data.data.units);

      setBuildingOptions(optionsResponse.data.data.options);
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      }
      console.log(err);
    }
    setLoading(false);
  };


  const getBuilding = async () => {
    setLoading(true);
    try {
      const response = await axios.get("building_manager/profile");
      setBuilding(response.data.data.building);
    } catch (err) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      }
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    if (value) {
      const filteredUnits = units.filter((unit) => {
        return unit.unit_number.includes(value);
      });
      setFilteredUnits(filteredUnits);
    } else {
      setFilteredUnits(units);
    }
  };

  const handleSelectUnit = async (unit) => {
    setInvoicesLoading(true);
    setSelectedUnit(unit);
    try {
      const response = await axios.get(
        `/building_manager/invoices?unit=${unit.id}&filter=verified&start_date=${rangeStart}&end_date=${rangeEnd}&resType=${residentType}`
      );
      setInvoices(response.data.data.invoices);
      setInvoicesHasMore(response.data.data.has_more);
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      }
      console.log(err);
    }
    setInvoicesLoading(false);
  };

  const loadMoreInvoices = async (page) => {
    try {
      const response = await axios.get(
        `/building_manager/invoices?unit=${selectedUnit.id}&filter=verified&page=${page}`
      );
      setInvoices([...invoices, ...response.data.data.invoices]);
      setInvoicesHasMore(response.data.data.has_more);
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      }
      console.log(err);
    }
  };

  useEffect(() => {
    getUnits();
    return () => { };
  }, []);

  const handleExcelData = () => {
    const slug = localStorage.getItem("buildingSlug");
    let data = [];
    if (slug == "hshcomplex") {
      invoices.map((invoice) => {
        data.push({
          شناسه: invoice.id,
          توضیحات: invoice.description,
          تاریخ: moment(invoice.created_at).format("jYYYY/jMM/jDD"),
          "بدهکار (علی الحساب)": invoice.amount < 0 ? invoice.amount * -10 : "",
          "بستانکار (علی الحساب)": invoice.amount > 0 ? invoice.amount * 10 : "",
          "مانده (علی الحساب)": invoice.balance * 10,
        });
      });
    } else {
      invoices.map((invoice) => {
        data.push({
          شناسه: invoice.id,
          توضیحات: invoice.description,
          تاریخ: moment(invoice.created_at).format("jYYYY/jMM/jDD"),
          بدهکار: invoice.amount < 0 ? invoice.amount * -10 : "",
          بستانکار: invoice.amount > 0 ? invoice.amount * 10 : "",
          مانده: invoice.balance * 10,
        });
      });
    }
    setExcelData(data);
  };

  const handleGetPdf = async (name) => {
    if (isNative() && window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        action: "downloadPdf",
        type: "pdf",
        name: name,
        url: `/building_manager/invoices/pdf?unit=${selectedUnit.id}&filter=verified&start_date=${rangeStart}&end_date=${rangeEnd}`,
        token: localStorage.getItem("accessToken"),
        baseUrl: apiConfig.baseUrl,
        method: "GET",
      }));
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`/building_manager/invoices/pdf?unit=${selectedUnit.id}&filter=verified&start_date=${rangeStart}&end_date=${rangeEnd}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", name + ".zip");
      link.click();
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    handleExcelData();
  }, [invoices]);

  return (
    <Card
      style={
        {
          // height: "calc(100vh - 180px)",
        }
      }
    >
      <div
        className="pb-0 pt-2 h-100"
        style={{
          height: "calc(100vh - 180px)",
        }}
      >
        {selectedInvoice && selectedInvoice.amount > 0 && selectedInvoice.payment_method !== "پرداخت آنلاین" && (
          <EditDepositModal
            show={editDepositModal}
            setShow={setEditDepositModal}
            refreshData={() => {
              handleSelectUnit(selectedUnit);
              getUnits();
            }}
            setLoading={setLoading}
            deposit={selectedInvoice}
          />
        )}
        {selectedInvoice && selectedInvoice.amount < 0 && (
          <EditDebtModal
            show={editDebtModal}
            setShow={setEditDebtModal}
            refreshData={() => {
              handleSelectUnit(selectedUnit);
              getUnits();
            }}
            setLoading={setLoading}
            debt={selectedInvoice}
          />
        )}

        <BlockUi tag="div" blocking={loading} message={<></>} />
        <h3 className="text-center mb-2">صورتحساب ها</h3>
        <Row
          style={{
            borderTop: "1px solid #b4b7bd",
            marginRight: "0",
            marginLeft: "0",
            height: "calc(100vh - 140px)",
          }}
        >
          {(!selectedUnit || !ismobile) && (
            <Sidebar
              units={units}
              filteredUnits={filteredUnits}
              selectedUnit={selectedUnit}
              setSelectedUnit={setSelectedUnit}
              ismobile={ismobile}
              handleSearch={handleSearch}
              handleSelectUnit={handleSelectUnit}
              buildingOptions={buildingOptions}
            />
          )}
          {selectedUnit ? (
            <Col md="8" className="p-0 pt-1">
              <span className="px-2">
                {ismobile && (
                  <a
                    className="float-left px-1"
                    onClick={() => {
                      setSelectedUnit(null);
                    }}
                  >
                    <FontAwesomeIcon icon={faArrowRight} />
                  </a>
                )}
                واحد {selectedUnit.unit_number}
              </span>
              <h5 className="pt-2 px-1 d-flex justify-content-between">
                <DateRangeSelector setStart={setRangeStart} setEnd={setRangeEnd} />
                <UncontrolledDropdown
                  className="me-1"
                  direction="down"
                >
                  <DropdownToggle
                    caret
                    color="success"
                  >
                    خروجی
                  </DropdownToggle>
                  <DropdownMenu>
                    <ExportToExcel
                      dropDown={true}
                      excelData={excelData}
                      fileName={
                        "واحد " +
                        selectedUnit.unit_number +
                        " - " +
                        moment().format("jYYYY-jMM-jDD")
                      }
                    />
                    {/* <DropdownItem> */}
                    {/* <PDFDownloadLink className="dropdown-item" document={<InvoicesPdf data={excelData} unit={selectedUnit} building={building} date={moment().format("jYYYY/jMM/jDD")} />} fileName={"واحد " +
                      selectedUnit.unit_number +
                      " - " +
                      moment().format("jYYYY-jMM-jDD") + ".pdf"}>
                      {({ blob, url, loading, error }) =>
                        loading ? '...' : 'خروجی PDF'
                      }
                    </PDFDownloadLink> */}
                    {/* </DropdownItem> */}
                    <DropdownItem onClick={() => {
                      handleGetPdf("واحد " +
                        selectedUnit.unit_number +
                        " - " +
                        moment().format("jYYYY-jMM-jDD"));
                    }}>
                      خروجی PDF
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </h5>
              {buildingOptions.separate_resident_and_owner_invoices == 1 && (
                <h5 className="px-1 d-flex justify-content-between">
                  <Nav pills>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: residentType === "all" })}
                        onClick={() => {
                          setResidentType("all");
                        }}
                      >
                        واحد
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: residentType === "resident" })}
                        onClick={() => {
                          setResidentType("resident");
                        }}
                      >
                        ساکن
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: residentType === "owner" })}
                        onClick={() => {
                          setResidentType("owner");
                        }}
                      >
                        مالک
                      </NavLink>
                    </NavItem>
                  </Nav>
                </h5>
              )}
              {!invoicesLoading ? (
                <div className="">
                  <ListGroup
                    flush
                    style={{
                      height: "calc(100vh - 280px)",
                      overflowY: "auto",
                    }}
                    ref={(ref) => (this.scrollParentRef = ref)}
                  >
                    <InfiniteScroll
                      pageStart={1}
                      loadMore={loadMoreInvoices}
                      hasMore={invoicesHasMore}
                      useWindow={false}
                      loader={
                        <ListGroupItem key={0}>
                          <div className="text-center">
                            در حال بارگذاری صورتحساب ها
                            <FontAwesomeIcon
                              icon={faSpinner}
                              spin
                              size="sm"
                              className="ms-2"
                            />
                          </div>
                        </ListGroupItem>
                      }
                    >
                      {invoices.map((invoice) => (
                        <ListGroupItem key={invoice.id}>
                          <div>
                            <ListGroupItemText>
                              <span className="d-flex justify-content-between mb-1">
                                {invoice.description}
                                <ShowAmount amount={invoice.amount} />
                              </span>
                              <span className="d-flex justify-content-between">
                                <span className="text-muted">
                                  {moment(invoice.created_at).format(
                                    "jYYYY/jMM/jDD"
                                  )}
                                </span>
                                {invoice.payment_method !== "پرداخت آنلاین" && invoice.id && (
                                  <div>
                                    <a
                                      onClick={() => {
                                        setSelectedInvoice(invoice);
                                        if (invoice.amount > 0) {
                                          setEditDepositModal(true);
                                        } else {
                                          setEditDebtModal(true);
                                        }
                                      }}
                                    >
                                      <FontAwesomeIcon
                                        icon={faPencil}
                                        size="lg"
                                      />
                                    </a>
                                    <a
                                      color="danger"
                                      className="ms-0"
                                      size="sm"
                                      outline
                                      onClick={() => {
                                        MySwal.fire({
                                          title:
                                            invoice.amount < 0
                                              ? "آیا از حذف بدهی مطمئن هستید؟"
                                              : "آیا از حذف پرداختی مطمئن هستید؟",
                                          text: "این عملیات قابل بازگشت نیست!",
                                          icon: "warning",
                                          showCancelButton: true,
                                          customClass: {
                                            confirmButton: "btn btn-danger",
                                            cancelButton: "btn btn-dark ms-1",
                                          },
                                          confirmButtonText: "بله، حذف شود!",
                                          cancelButtonText: "انصراف",
                                        }).then((result) => {
                                          if (result.isConfirmed) {
                                            setLoading(true);
                                            axios
                                              .delete(
                                                "/building_manager/invoices/" +
                                                invoice.id
                                              )
                                              .then((response) => {
                                                toast.success(
                                                  response.data.message
                                                );
                                                setInvoices(
                                                  invoices.filter(
                                                    (item) =>
                                                      item.id !== invoice.id
                                                  )
                                                );
                                                getUnits();
                                              })
                                              .catch((err) => {
                                                if (
                                                  err.response &&
                                                  err.response.data.message
                                                ) {
                                                  toast.error(
                                                    err.response.data.message
                                                  );
                                                }
                                                console.log(err);
                                              })
                                              .finally(() => {
                                                setLoading(false);
                                              });
                                          }
                                        });
                                      }}
                                    >
                                      <FontAwesomeIcon
                                        icon={faTrash}
                                        className="ms-2"
                                        size="lg"
                                        color="red"
                                      />
                                    </a>
                                  </div>
                                )}
                              </span>
                            </ListGroupItemText>
                          </div>
                        </ListGroupItem>
                      ))}
                    </InfiniteScroll>
                  </ListGroup>
                </div>
              ) : (
                <div className="h-100">
                  <div
                    className="text-center"
                    style={{
                      position: "relative",
                      top: "30%",
                      transform: "translateY(-50%)",
                    }}
                  >
                    <FontAwesomeIcon icon={faSpinner} spin size="4x" />
                  </div>
                </div>
              )}
            </Col>
          ) : (
            !ismobile && (
              <Col md="8" className="p-0">
                <div className="h-100">
                  <div
                    className="text-center m-auto"
                    style={{
                      position: "relative",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  >
                    <h1>لطفا یک واحد را انتخاب کنید</h1>
                  </div>
                </div>
              </Col>
            )
          )}
        </Row>
      </div>
    </Card>
  );
};

const Sidebar = ({
  units,
  filteredUnits,
  selectedUnit,
  setSelectedUnit,
  ismobile,
  handleSearch,
  handleSelectUnit,
  buildingOptions
}) => {
  const currency = localStorage.getItem("currency");
  return (
    <Col
      md="4"
      className="p-0"
      style={
        !ismobile
          ? {
            borderLeft: "1px solid #b4b7bd",
            height: "calc(100vh - 180px)",
          }
          : {
            height: "calc(100vh - 180px)",
          }
      }
    >
      <div className="px-2 pb-1 pt-2">
        <Input
          type="text"
          placeholder="جستجو بر اساس نام واحد"
          onChange={handleSearch}
        />
      </div>
      <div className="px-2 pb-1 d-flex-justify-content-between">
        <span className="text-muted mt-2 me-1">
          جمع بدهی ها :
          <PriceFormat
            convertToRial={currency === 'rial'}
            price={units.reduce((total, unit) => {
              if (unit.charge_debt > 0) return total + unit.charge_debt;
              return total;
            }, 0)}
          />
        </span>
        <br></br>
        <span className="text-muted mt-2">
          جمع طلب ها :
          <PriceFormat
            convertToRial={currency === 'rial'}
            price={units.reduce((total, unit) => {
              if (unit.charge_debt < 0) return total + -1 * unit.charge_debt;
              return total;
            }, 0)}
          />
        </span>
      </div>
      <ListGroup
        flush
        style={{
          height: "calc(100% - 155px)",
        }}
      >
        <PerfectScrollbar
          options={{
            wheelPropagation: false,
          }}
        >
          {filteredUnits.map((unit) => (
            <ListGroupItem
              key={unit.id}
              tag="button"
              action
              active={selectedUnit && selectedUnit.id === unit.id}
              onClick={() => {
                setSelectedUnit(unit);
                handleSelectUnit(unit);
              }}
            >
              <ListGroupItemHeading>
                واحد {unit.unit_number}
              </ListGroupItemHeading>
              <ListGroupItemText>
                {buildingOptions.separate_resident_and_owner_invoices == 1 ? (
                  <>
                    <ShowDebt debt={unit.resident_debt} type="ساکن" />
                    <br />
                    <ShowDebt debt={unit.owner_debt} type="مالک" />
                  </>
                ) : (
                  <ShowDebt debt={unit.charge_debt} />
                )}
              </ListGroupItemText>
            </ListGroupItem>
          ))}
        </PerfectScrollbar>
      </ListGroup>
    </Col>
  );
};

const ShowDebt = ({ debt, type = "" }) => {
  const currency = localStorage.getItem("currency");
  if (debt > 0) {
    return (
      <span className="text-danger">
        مانده بدهی {type && "(" + type + ")"}: <PriceFormat
          convertToRial={currency === 'rial'} price={debt} />
      </span>
    );
  } else if (debt < 0) {
    return (
      <span className="text-dark">
        طلب {type && "(" + type + ")"}: <PriceFormat
          convertToRial={currency === 'rial'} price={-1 * debt} />
      </span>
    );
  } else {
    return <span> </span>;
  }
};

const ShowAmount = ({ amount }) => {
  const currency = localStorage.getItem("currency");
  if (amount > 0) {
    return (
      <span className="text-dark">
        مبلغ: <PriceFormat
          convertToRial={currency === 'rial'} price={amount} />
      </span>
    );
  } else if (amount < 0) {
    return (
      <span className="text-danger">
        مبلغ: <PriceFormat
          convertToRial={currency === 'rial'} price={-1 * amount} />
      </span>
    );
  } else {
    return <span> </span>;
  }
};

export default Invoices;
