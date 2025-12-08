import React, { useEffect, useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { FaEdit, FaTrash, FaCheck, FaPlus, FaTimes } from 'react-icons/fa';
import DataTable from "react-data-table-component";
export default function Category() {

  const { token, userPerms } = useContext(AuthContext);
  const [editingCatId, setEditingCatId] = useState(null)
  const [catToDelete, setCatToDelete] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    'name': ''
  });
  const [modalMessage, setModalMessage] = useState('');
  const [modalStatus, setModalStatus] = useState('');

  const fetchCategories = async () => {

    try {

      const response = await axios.get('http://127.0.0.1:8000/api/categories/', {
        headers: { Authorization: `token ${token}` }
      });

      setCategories(response.data);
      console.log(response.data)
    }

    catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []
  );


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };



  const resetForm = () => {
    setFormData({
      "name": ""
    });
    setEditingCatId(null);
    setShowForm(false);
  };

  const handleEdit = (cat) => {
    setFormData({
      name: cat.name,
    });
    setEditingCatId(cat.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCatId) {
        await axios.put(`http://127.0.0.1:8000/api/categories/${editingCatId}/`, formData, {
          headers: { Authorization: `token ${token}` }
        });
      }
      else {
        await axios.post('http://127.0.0.1:8000/api/categories/', formData, {
          headers: { Authorization: `token ${token}` }
        });
      }
      fetchCategories();
      resetForm();
    }
    catch (error) {
      console.error('Submit error:', error);
      alert('Failed to save task');
    }
  };

  const confirmDelete = async () => {
    console.log('comofrm')
    try {
      const response = await axios.delete(`http://127.0.0.1:8000/api/categories/${catToDelete}/`, {
        headers: { Authorization: `token ${token}` },
      });
      if (response.status === 204) {
        setCategories(categories.filter((cat) => cat.id !== catToDelete))
        setModalMessage('Category deleted successfully.');
        setModalStatus('success');
      }
    }
    catch (error) {
      if (error.response) {
        setModalMessage(`Error: ${error.response.status} - ${error.response.data?.detail || 'Server error'}`);
      } else if (error.request) {
        setModalMessage('Error: No response from server.');
      } else {
        setModalMessage(`Error: ${error.message}`);
      }
      setModalStatus('error');
    }
    finally {
      setShowConfirmModal(false)
      setCatToDelete(null);
    }
  }




const columns = [
  {
    name: "Id",
    selector: row => row.id,
    sortable: true,
  },
  {
    name: "Name",
    selector: row => row.name,
    sortable: true,
  },
  {
    name: "Actions",
     cell: row => (
      <button
        className="btn btn-primary btn-sm"
        onClick={() => handleAction(row)}
      >
        View
      </button>
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
   
  },
];

const data = categories

  return (
    <>
      <div className='container mt-4'>
        {/* Confirm Delete Modal */}
        {showConfirmModal && (
          <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-danger">
                  <h5 className="modal-title text-white">Confirm Deletion</h5>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this task?</p>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>
                    <FaTimes /> Cancel
                  </button>
                  <button className="btn btn-danger" onClick={confirmDelete}>
                    <FaTrash /> Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Status Message Modal */}
        {modalMessage && (
          <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className={`modal-header ${modalStatus === 'success' ? 'bg-success' : 'bg-danger'}`}>
                  <h5 className="modal-title text-white">Status</h5>
                </div>
                <div className="modal-body">
                  <p>{modalMessage}</p>
                </div>
                <div className="modal-footer">
                  <button
                    className={`btn btn-outline-${modalStatus === 'success' ? 'success' : 'danger'}`}
                    onClick={() => setModalMessage('')}
                  >
                    {modalStatus === 'success' ? <FaCheck /> : <FaTimes />} OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <h2>Category</h2>
        {userPerms.permissions?.tasks?.includes('add_category') && (
          <button className="btn btn-success mb-3 mt-5" onClick={() => setShowForm(true)}>
            {editingCatId ? (<> Update Category</>) : (<><FaPlus /> Create Category</>)}
          </button>
        )}
        {showForm && <form onSubmit={handleSubmit} >
          <input className='form-control' type="text" name='name' value={formData.name} onChange={handleChange} />
          <div className="d-flex gap-2 mt-3">
            <button type="submit" className="btn btn-primary" >
              <FaPlus /> {editingCatId ? 'Update' : 'Create'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              <FaTimes /> Cancel
            </button>
          </div>
        </form>}
        <div>
          <table className="table striped mt-5">
            <thead>
              <tr>
                <td>Id</td>
                <td>Name</td>
                <td>Actions</td>
              </tr>
            </thead>
            <tbody>
              {categories ? (
                categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.id}</td>
                    <td>{category.name}</td>
                    <td>
                      {userPerms.permissions?.tasks?.includes('change_category') || userPerms.permissions?.tasks?.includes('delete_category') ? (
                        <>
                          {userPerms.permissions?.tasks?.includes('change_category') && (
                            <button className='btn btn-info me-2' onClick={() => handleEdit(category)} > <FaEdit/>edit</button>
                          )}
                          {userPerms.permissions?.tasks?.includes('delete_category') && (
                            <button className='btn btn-danger' onClick={() => {
                              setCatToDelete(category.id);
                              setShowConfirmModal(true);
                            }}  > delete</button>
                          )}
                        </>
                      ) : ("No permissions")}
                    </td>
                  </tr>
                ))
              ) : 'Loading .....'}
            </tbody>
          </table>
        </div>
        <DataTable
      title="Categories"
      columns={columns}
      data={data}
      responsive
      pagination
    />
      </div>

      
    </>
  )
}
