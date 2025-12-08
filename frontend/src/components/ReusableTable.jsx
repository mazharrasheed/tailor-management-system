// components/ReusableTable.js
import React, { useState, useMemo, useEffect } from "react";

const ReusableTable = ({ data, columns, rowsPerPageOptions = [5, 10, 20], extra = {} }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Automatically sort by first sortable column on mount
  useEffect(() => {
    const firstSortable = columns.find((col) => col.sortable);
    if (firstSortable) {
      setSortConfig({ key: firstSortable.accessor, direction: "asc" });
    }
  }, [columns]);

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((row) =>
      columns.some((col) => {
        const val =
          typeof col.accessor === "function"
            ? col.accessor(row)
            : row[col.accessor];
        return String(val || "").toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, columns]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const getValue = (row) =>
        typeof sortConfig.key === "function"
          ? sortConfig.key(row)
          : row[sortConfig.key];

      const aVal = getValue(a);
      const bVal = getValue(b);

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRows = sortedData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);


  const highlightText = (text, searchTerm) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return (
      <span
        dangerouslySetInnerHTML={{
          __html: String(text).replace(regex, `<mark>$1</mark>`),
        }}
      />
    );
  };

  return (
    <>
      {/* Search & Rows per page */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <input
          type="text"
          className="form-control w-25"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        <div>
          <label className="me-2 fw-bold">Rows per page:</label>
          <select
            className="form-select d-inline-block w-auto"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(parseInt(e.target.value));
              setCurrentPage(1);
            }}
          >
            {rowsPerPageOptions.map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <table className="table table-striped table-bordered table-hover">
        <thead className="table-light">
          <tr>
            {columns.map((col) => (
              <th className="text-center"
                key={col.header}
                onClick={() => col.sortable && handleSort(col.accessor)}
                style={{ cursor: col.sortable ? "pointer" : "default" }}
              >
                {col.header}
                {col.sortable && sortConfig.key === col.accessor && (
                  <span className="ms-2">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentRows.length > 0 ? (
            currentRows.map((row, i) => (
              <tr key={i}>
                {columns.map((col, j) => (
                  <td
                    key={j}
                    className={col.center ? "text-center" : ""}
                  >
                    {col.render
                      ? col.render(
                        typeof col.accessor === "function"
                          ? col.accessor(row)
                          : row[col.accessor],
                        row,
                        i,
                        extra
                      )
                      : highlightText(
                        typeof col.accessor === "function"
                          ? col.accessor(row)
                          : row[col.accessor],
                        searchTerm
                      )}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center">
                No data found.
              </td>
            </tr>
          )}
        </tbody>

      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center gap-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`btn btn-sm ${currentPage === i + 1 ? "btn-primary" : "btn-outline-primary"
                }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </>
  );
};

export default ReusableTable;
