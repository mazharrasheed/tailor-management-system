import React, { useState, useMemo } from "react";
import { FaCheck, FaEdit, FaTrash } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const highlightText = (text, searchTerm) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return (
        <span dangerouslySetInnerHTML={{ __html: text.replace(regex, `<mark>$1</mark>`) }} />
    );
};

const Table = ({
    tasks,
    users,
    userPerms,
    handleEdit,
    setTaskToDelete,
    setShowConfirmModal,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [sortConfig, setSortConfig] = useState({ key: "title", direction: "asc" });

    const userMap = useMemo(() => {
        const map = {};
        users.forEach((user) => (map[user.id] = user.username));
        return map;
    }, [users]);

    const sortedTasks = useMemo(() => {
        let sortableTasks = [...tasks];
        if (sortConfig.key) {
            sortableTasks.sort((a, b) => {
                let aVal, bVal;

                if (sortConfig.key === "assigned_to") {
                    aVal = userMap[a.assigned_to] || "";
                    bVal = userMap[b.assigned_to] || "";
                } else if (sortConfig.key === "completed") {
                    aVal = a.completed ? 1 : 0;
                    bVal = b.completed ? 1 : 0;
                } else {
                    aVal = a[sortConfig.key];
                    bVal = b[sortConfig.key];
                }

                if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
                return 0;
            });
        }
        return sortableTasks;
    }, [tasks, sortConfig, userMap]);

    const filteredTasks = sortedTasks.filter((task) => {
        const assignedUser = userMap[task.assigned_to] || "";
        const statusText = task.completed ? "completed" : "pending";
        return (
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            assignedUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
            statusText.includes(searchTerm.toLowerCase())
        );
    });

    const indexOfLastTask = currentPage * rowsPerPage;
    const indexOfFirstTask = indexOfLastTask - rowsPerPage;
    const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
    const totalPages = Math.ceil(filteredTasks.length / rowsPerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const handleSort = (key) => {
        const direction = sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
        setSortConfig({ key, direction });
    };

    return (
        <>
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
                        {[5, 10, 20, 50].map((num) => (
                            <option key={num} value={num}>
                                {num}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="table-responsive" style={{ maxHeight: "500px", overflowY: "auto" }}>
                <table className="table table-bordered table-striped table-hover">
                    <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                        <tr>
                            <th className="text-center" onClick={() => handleSort("title")} style={{ cursor: "pointer" }}>
                                Title {sortConfig.key === "title" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                            </th>
                            <th className="text-center" onClick={() => handleSort("description")} style={{ cursor: "pointer" }}>
                                Description {sortConfig.key === "description" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                            </th>
                            <th className="text-center" onClick={() => handleSort("assigned_to")} style={{ cursor: "pointer" }}>
                                Assigned To {sortConfig.key === "assigned_to" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                            </th>
                            <th className="text-center" onClick={() => handleSort("completed")} style={{ cursor: "pointer" }}>
                                Status {sortConfig.key === "completed" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                            </th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentTasks.length > 0 ? (
                            currentTasks.map((task) => (
                                <tr key={task.id}>
                                    <td>{highlightText(task.title, searchTerm)}</td>
                                    <td>{highlightText(task.description, searchTerm)}</td>
                                    <td>{highlightText(userMap[task.assigned_to] || "Unknown", searchTerm)}</td>
                                    <td className="text-center">
                                        {task.completed ? (
                                            <>
                                                <FaCheck className="text-success" />{" "}
                                                <span className="ms-2">Completed</span>
                                            </>
                                        ) : (
                                            "Pending"
                                        )}
                                    </td>
                                    <td className="text-center">
                                        {userPerms.permissions?.tasks?.includes("change_task") ||
                                            userPerms.permissions?.tasks?.includes("delete_task") ? (
                                            <>
                                                {userPerms.permissions?.tasks?.includes("change_task") && (
                                                    <button
                                                        className="btn btn-sm btn-outline-primary me-2"
                                                        onClick={() => handleEdit(task)}
                                                        title="Edit Task"
                                                    >
                                                        <FaEdit /> Edit
                                                    </button>
                                                )}
                                                {userPerms.permissions?.tasks?.includes("delete_task") && (
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => {
                                                            setTaskToDelete(task.id);
                                                            setShowConfirmModal(true);
                                                        
                                                        }}
                                                        title="Delete Task"
                                                    >
                                                        <FaTrash /> Delete
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <span>No Permissions</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center">
                                    No tasks found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                    >
                        Previous
                    </button>

                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index}
                            className={`btn btn-sm ${currentPage === index + 1 ? "btn-primary" : "btn-outline-primary"
                                }`}
                            onClick={() => handlePageChange(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}

                    <button
                        className="btn btn-outline-secondary btn-sm"
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                    >
                        Next
                    </button>

                </div>
            )}
        </>
    );
};

export default Table;
