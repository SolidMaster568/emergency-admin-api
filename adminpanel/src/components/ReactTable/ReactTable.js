/*eslint-disable*/
import React from "react";
import {
  useTable,
  useFilters,
  useAsyncDebounce,
  useSortBy,
  usePagination,
} from "react-table";
import classnames from "classnames";
// A great library for fuzzy filtering/sorting items
import { matchSorter } from "match-sorter";
// react plugin used to create DropdownMenu for selecting items
import Select from "react-select";
// reactstrap components
import { FormGroup, Input, Row, Col } from "reactstrap";

// Define a default UI for filtering
function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}) {
  const count = preFilteredRows.length;

  return (
    <FormGroup>
      <Input
        type="email"
        value={filterValue || ""}
        onChange={(e) => {
          setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
        }}
        placeholder={`Search ${count} records...`}
      />
    </FormGroup>
  );
}

function fuzzyTextFilterFn(rows, id, filterValue) {
  return matchSorter(rows, filterValue, { keys: [(row) => row.values[id]] });
}

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = (val) => !val;

// Our table component
function Table({ columns, data, openModal, isExport }) {
  const [numberOfRows, setNumberOfRows] = React.useState({
    value: 10,
    label: 10,
  });
  const [pageSelect, handlePageSelect] = React.useState(0);
  // const filterTypes = React.useMemo(
  //   () => ({
  //     // Add a new fuzzyTextFilterFn filter type.
  //     fuzzyText: fuzzyTextFilterFn,
  //     // Or, override the default text filter to use
  //     // "startWith"
  //     text: (rows, id, filterValue) => {
  //       return rows.filter((row) => {
  //         const rowValue = row.values[id];
  //         return rowValue !== undefined
  //           ? String(rowValue)
  //               .toLowerCase()
  //               .startsWith(String(filterValue).toLowerCase())
  //           : true;
  //       });
  //     },
  //   }),
  //   []
  // );

  const defaultColumn = React.useMemo(
    () => ({
      // Let's set up our default Filter UI
      // Filter: DefaultColumnFilter,
    }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state,
    visibleColumns,
    nextPage,
    pageOptions,
    pageCount,
    previousPage,
    canPreviousPage,
    canNextPage,
    setPageSize,
    gotoPage,
  } = useTable(
    {
      columns,
      data,
      defaultColumn, // Be sure to pass the defaultColumn option
      // filterTypes,
      initialState: { pageSize: 10, pageIndex: 0 },
    },
    useFilters, // useFilters!
    useSortBy,
    usePagination
  );

  // We don't want to render all of the rows for this example, so cap
  // it for this use case
  // const firstPageRows = rows.slice(0, 10);
  let pageSelectData = Array.apply(null, Array(pageOptions.length)).map(
    function () { }
  );
  let numberOfRowsData = [5, 10, 20, 25, 50, 100];
  return (
    <>
      <div className="ReactTable -striped -highlight">
        <div className="pagination-top">
          <div className="-pagination" style={{ float: "right" }}>
            <span className="row_per_pages">Rows per page:</span>
            <Select
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  boxShadow: "none",
                  // border: state.isFocused && "none",
                  border: "none",
                  "&:active": {
                    borderColor: "#296ef6",
                  },
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isFocused && "lightgray",
                  color: state.isFocused && "#296ef6",
                }),
                indicatorSeparator: () => ({ display: "none" }),
              }}
              className="sel_rows"
              name="singleSelect"
              style={{ width: 80 }}
              value={numberOfRows}
              onChange={(value) => {
                console.log(value);
                setPageSize(value.value);
                setNumberOfRows(value);
                handlePageSelect(0);
              }}
              options={numberOfRowsData.map((prop) => {
                return {
                  value: prop,
                  label: prop,
                };
              })}
              placeholder=""
            />
            {/* <span style={{ padding: 10 }}>
              {numberOfRows.value * pageSelect + 1}-
              {numberOfRows.value * (pageSelect + 1) > data.length
                ? data.length
                : numberOfRows.value * (pageSelect + 1)}
              of {data.length}
            </span> */}
            <button
              onClick={() => {
                handlePageSelect(pageSelect - 1);
                previousPage();
              }}
              disabled={!canPreviousPage}
              className="next_prev_btn"
            >
              <i className="tim-icons icon-minimal-left" />
            </button>
            <button
              onClick={() => {
                nextPage();
                handlePageSelect(pageSelect + 1);
              }}
              disabled={!canNextPage}
              className="next_prev_btn"
            >
              <i className="tim-icons icon-minimal-right" />
            </button>
            {isExport && (
              <button
                type="button"
                onClick={() => openModal({})}
                className="-btn"
                style={{
                  width: "60px",
                  height: "35px",
                  padding: "0px",
                  borderRadius: "4px",
                  marginLeft: 50,
                }}
              >
                <i className="tim-icons icon-simple-add" />
              </button>
            )}
          </div>
        </div>
        <div className="myreacttable">
          <table {...getTableProps()} className="rt-table">
            <thead className="rt-thead -header">
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()} className="rt-tr">
                  {headerGroup.headers.map((column, key) => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      className={classnames("rt-th rt-resizable-header", {
                        "-cursor-pointer": headerGroup.headers.length - 1 !== key,
                        "-sort-asc": column.isSorted && !column.isSortedDesc,
                        "-sort-desc": column.isSorted && column.isSortedDesc,
                      })}
                    >
                      <div className="rt-resizable-header-content">
                        {column.render("Header")}
                      </div>
                      {/* Render the columns filter UI */}
                      {/* <div>
                      {headerGroup.headers.length - 1 === key
                        ? null
                        : column.canFilter
                        ? column.render("Filter")
                        : null}
                    </div> */}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()} className="rt-tbody">
              {page.map((row, i) => {
                prepareRow(row);
                return (
                  <tr
                    {...row.getRowProps()}
                    className={classnames(
                      "rt-tr",
                      { " -odd": i % 2 === 0 },
                      { " -even": i % 2 === 1 }
                    )}
                  >
                    {row.cells.map((cell, index) => {
                      return (
                        <td {...cell.getCellProps()} className="rt-td">
                          {cell.render("Cell")}
                        </td>
                        // <>
                        //   {index === 3 ? (
                        //     <td {...cell.getCellProps()} className="rt-td">
                        //       {cell.render("Cell")}
                        //     </td>
                        //   ) : index === 4 ? (
                        //     <td
                        //       {...cell.getCellProps()}
                        //       className="rt-td"
                        //       ref={(node) =>
                        //         node?.style.setProperty(
                        //           "color",
                        //           `${
                        //             cell.value === "Pending"
                        //               ? "pink"
                        //               : cell.value === "Active"
                        //               ? "yellow"
                        //               : "green"
                        //           }`,
                        //           "important"
                        //         )
                        //       }
                        //     >
                        //       {cell.render("Cell")}
                        //     </td>
                        //   ) : (
                        //     <td {...cell.getCellProps()} className="rt-td">
                        //       {cell.render("Cell")}
                        //     </td>
                        //   )}
                        // </>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pagination-bottom"></div>
      </div>
    </>
  );
}

// Define a custom filter filter function!
function filterGreaterThan(rows, id, filterValue) {
  return rows.filter((row) => {
    const rowValue = row.values[id];
    return rowValue >= filterValue;
  });
}

// This is an autoRemove method on the filter function that
// when given the new filter value and returns true, the filter
// will be automatically removed. Normally this is just an undefined
// check, but here, we want to remove the filter if it's not a number
filterGreaterThan.autoRemove = (val) => typeof val !== "number";

export default Table;
