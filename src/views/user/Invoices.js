import { useState } from "react";
import { useEffect } from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-hot-toast";
import axios from "axios";
import PriceFormat from "../../components/PriceFormat";
import { Badge, Card } from "reactstrap";
import moment from "moment-jalaali";
import BlockUi from "@availity/block-ui";
import { useMediaQuery } from "react-responsive";
import tableConfig from "../../configs/tableConfig";
import { truncateString } from "../../utility/Utils";

const invoices = () => {
  const [data, setdata] = useState([]);
  const [loading, setLoading] = useState(false);

  const ismobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const response = await axios.get("/user/transactions");
        setdata(response.data.data.transactions);
      } catch (err) {
        if (err.response && err.response.data.message) {
          toast.error(err.response.data.message);
        }
        console.log(err);
      }
      setLoading(false);
    })();

    return () => {
      setdata([]);
    };
  }, []);

  let columns = [
    {
      name: "تاریخ",
      selector: (row) => row.created_at,
      sortable: true,
      cell: (row) => moment(row.created_at).format("HH:mm jYYYY/jMM/jDD"),
    },
    {
      name: "مبلغ",
      selector: (row) => row.amount,
      cell: (row) => <PriceFormat price={row.amount} convertToRial />,
      sortable: true,
    },
  ];

  if (!ismobile) {
    columns = [
      {
        name: "#",
        selector: (row) => row.id,
        sortable: true,
      },
      ...columns,
    ].concat([
      {
        name: "شرح",
        selector: (row) => row.description,
        cell: (row) => <div className="text-warp">{truncateString(row.description, 50)}</div>,
      },
      {
        name: "شیوه پرداخت",
        selector: (row) => row.payment_method,
        cell: (row) => (
          <Badge
            color={row.payment_method === "پرداخت آنلاین" ? "success" : "info"}
          >
            {row.payment_method}
          </Badge>
        ),
      },
      {
        name: "وضعیت",
        selector: (row) => row.is_verified,
        sortable: true,
        cell: (row) => (
          <>
            <Badge color={row.is_verified ? "success" : "warning"}>
              {row.is_verified ? "تایید شده" : "در انتظار تایید"}
            </Badge>
          </>
        ),
      },
    ]);
  }

  return (
    <Card
      style={{
        minHeight: "89vh",
      }}
    >
      <div className="pt-3 pb-5">
        <BlockUi tag="div" blocking={loading} message={<></>} />
        <h3 className="text-center mb-3">صورتحساب ها</h3>
        <DataTable
          title="صورتحساب ها"
          columns={columns}
          data={data}
          {...tableConfig}
          expandableRows
          expandOnRowClicked={true}
          conditionalRowStyles={[
            {
              when: row => row.is_verified === true,
              style: {
                backgroundColor: 'rgba(40, 199, 111, 0.15)',
                '&:hover': {
                  backgroundColor: 'rgba(40, 199, 111, 0.25)',
                },
              },
            },
          ]}
          expandableRowsComponent={({ data }) => (
            <div className="px-2 py-1">
              <div className="">
                <span className="font-weight-bold">شرح :</span>
                <span className="ml-2">{data.description}</span>
              </div>
              {data.payment_method === "پرداخت آنلاین" && (
                <div className="">
                  <span className="font-weight-bold">شماره پیگیری:</span>
                  <span className="ml-2">{data.trace_number}</span>
                </div>
              )}
              <div className="">
                <span className="font-weight-bold">ساختمان :</span>
                <span className="ml-2">{data.unit?.building.name}</span>
              </div>
              {data.attachments && data.attachments.length > 0 && (
                <div className="">
                  <span className="font-weight-bold">فایل های پیوست:</span>
                  <br />
                  <span className="ml-2">
                    {data.attachments.map((attachment, index) => (
                      <a
                        href={attachment.file}
                        target="_blank"
                        className="mr-2"
                        key={index}
                      >
                        <img src={attachment.file} height="200" />
                      </a>
                    ))}
                  </span>
                </div>
              )}
              {ismobile && (
                <>
                  <div className="">
                    <span className="font-weight-bold">شیوه پرداخت:</span>
                    <span className="ml-2">
                      <Badge
                        color={
                          data.payment_method === "پرداخت آنلاین"
                            ? "success"
                            : "info"
                        }
                      >
                        {data.payment_method}
                      </Badge>
                    </span>
                  </div>
                  <div className="">
                    <span className="font-weight-bold">وضعیت:</span>
                    <span className="ml-2">
                      <Badge color={data.is_verified ? "success" : "warning"}>
                        {data.is_verified ? "تایید شده" : "در انتظار تایید"}
                      </Badge>
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        />
      </div>
    </Card>
  );
};

export default invoices;