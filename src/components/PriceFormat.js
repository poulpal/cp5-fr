import { NumericFormat } from "react-number-format";

const PriceFormat = ({ price, decimalScale=1, showCurrency=true, accounting=false, convertToRial=false, currency="تومان", strikeThrough=false }) => {
  if (convertToRial) {
    price = price * 10;
    currency = "ریال";
  }
  if (price < 0 && !accounting) {
    return (
      <span>
        <NumericFormat
          value={price * -1}
          displayType={"text"}
          thousandSeparator={true}
          decimalScale={decimalScale}
          style={{ textDecoration: strikeThrough ? "line-through" : "" }}
        />
        {"- "}
        {showCurrency ? currency : ""}
      </span>
    );
  }
  if (price < 0 && accounting) {
    return (
      <span className="text-danger">
        {accounting && "( "}
        <NumericFormat
          value={price * -1}
          displayType={"text"}
          thousandSeparator={true}
          decimalScale={decimalScale}
          style={{ textDecoration: strikeThrough ? "line-through" : "" }}
        />
        {!accounting && "- "}
        {showCurrency ? currency : ""}
        {accounting && " )"}
      </span>
    );
  }
  return (
    <span>
      <NumericFormat
        value={price}
        displayType={"text"}
        thousandSeparator={true}
        decimalScale={decimalScale}
        style={{ textDecoration: strikeThrough ? "line-through" : "" }}
      />
      {" "}
      {showCurrency ? currency : ""}
    </span>
  );
};

export default PriceFormat;
