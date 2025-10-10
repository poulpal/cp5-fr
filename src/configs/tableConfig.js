const tableConfig = {
  pagination: true,
  paginationPerPage: 20,
  paginationRowsPerPageOptions: [20, 50, 100, 200, 500, 1000],
  paginationComponentOptions: {
    rowsPerPageText: "تعداد در هر صفحه:",
    rangeSeparatorText: "از",
    noRowsPerPage: false,
    selectAllRowsItem: true,
    selectAllRowsItemText: "همه",
  },
  theme: "light",
  noHeader: true,
  // fixedHeader: true,
  // fixedHeaderScrollHeight: "59vh",
  direction: "rtl",
  progressComponent: <></>,
  noDataComponent: (
    <>
      <h2>موردی وجود ندارد</h2>
    </>
  ),
};

export default tableConfig;
