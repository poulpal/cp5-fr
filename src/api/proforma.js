import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  withCredentials: true
});

// payload: { package_slug, period, buyer?, discount?, tax_percent?, building_id? }
export async function createProforma(payload) {
  // توجه: فرانت شما مستقیم به /v1 می‌زند نه /api/v1
  const { data } = await api.post("/v1/proforma", payload);
  return data.data; // { id, proforma_number, total, currency, expires_at }
}

export async function getProforma(id) {
  const { data } = await api.get(`/v1/proforma/${id}`);
  return data.data; // شیء کامل پیش‌فاکتور با items
}
