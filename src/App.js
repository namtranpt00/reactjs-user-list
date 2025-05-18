import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: "",
    age: "",
    companyId: "",
    avatar: null, // Store the File object here
  });
  const [avatarPreview, setAvatarPreview] = useState(null); // For image preview
  const [deleteConfirmationId, setDeleteConfirmationId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "https://66a39c4e44aa63704581e216.mockapi.io/api/v1/users"
        );
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, []);

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  const handleAddUserClick = () => {
    setIsAddingUser(true);
  };

  const handleCloseAddUserModal = () => {
    setIsAddingUser(false);
    setNewUser({ firstName: "", age: "", companyId: "", avatar: null });
    setAvatarPreview(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewUser((prevUser) => ({ ...prevUser, avatar: file }));
      // For preview:
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setNewUser((prevUser) => ({ ...prevUser, avatar: null }));
      setAvatarPreview(null);
    }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();

    let avatarUrl = null;

    if (newUser.avatar) {
      const presignRes = await axios.get(
        "http://localhost:3001/generate-presigned-url",
        {
          params: {
            filename: newUser.avatar.name,
            filetype: newUser.avatar.type,
          },
        }
      );

      await axios.put(presignRes.data.uploadUrl, newUser.avatar, {
        headers: {
          "Content-Type": newUser.avatar.type,
        },
      });

      avatarUrl = presignRes.data.fileUrl;
    }

    const newUserPayload = {
      firstName: newUser.firstName,
      age: newUser.age,
      companyId: newUser.companyId,
      avatar: avatarUrl,
    };

    try {
      const response = await axios.post(
        "https://66a39c4e44aa63704581e216.mockapi.io/api/v1/users",
        newUserPayload
      );
      setUsers((prevUsers) => [...prevUsers, response.data]);
      setIsAddingUser(false);
      setNewUser({ firstName: "", age: "", companyId: "", avatar: null });
      setAvatarPreview(null);
    } catch (err) {
      console.error("Error adding user:", err);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirmationId(id);
  };

  const handleConfirmDelete = async (id) => {
    try {
      await axios.delete(
        `https://66a39c4e44aa63704581e216.mockapi.io/api/v1/users/${id}`
      );
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
      setDeleteConfirmationId(null);
    } catch (err) {
      console.error(`Error deleting user with ID ${id}:`, err);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmationId(null);
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div>Error loading users: {error.message}</div>;
  }

  return (
    <div className="app-container">
      <h1 className="title">User List</h1>
      <button className="add-user-button" onClick={handleAddUserClick}>
        Add New User
      </button>
      <ul className="user-list">
        {users.map((user) => (
          <li
            key={user.id}
            className="user-card"
            onClick={() => handleUserClick(user)}
            style={{ cursor: "pointer" }}
          >
            <div className="user-info-left">
              <div className="user-avatar">
                <img
                  src={user.avatar}
                  alt={`${user.firstName}'s Avatar`}
                  onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src = "URL_TO_DEFAULT_AVATAR"; // Replace with a default avatar URL
                  }}
                />
              </div>
              <div>
                <h2>{user.firstName}</h2>
                <p>ID: {user.id}</p>
              </div>
            </div>
            <button
              className="delete-button"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(user.id);
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={handleCloseModal}>
              &times;
            </button>
            <h2>{selectedUser.firstName}</h2>
            <div className="modal-details">
              <img
                src={selectedUser.avatar}
                alt={`${selectedUser.firstName}'s Avatar`}
                className="modal-avatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "URL_TO_DEFAULT_AVATAR";
                }}
              />
              <p>ID: {selectedUser.id}</p>
              <p>Age: {selectedUser.age}</p>
              <p>Company ID: {selectedUser.companyId}</p>
            </div>
          </div>
        </div>
      )}

      {isAddingUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={handleCloseAddUserModal}>
              &times;
            </button>
            <h2>Add New User</h2>
            <form onSubmit={handleAddUserSubmit} className="add-user-form">
              <div>
                <label htmlFor="firstName">First Name:</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={newUser.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="age">Age:</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={newUser.age}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="companyId">Company ID:</label>
                <input
                  type="text"
                  id="companyId"
                  name="companyId"
                  value={newUser.companyId}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="avatar">Avatar:</label>
                <input
                  type="file"
                  id="avatar"
                  name="avatar"
                  onChange={handleAvatarChange}
                  accept="image/*" // Optional: Accept only image files
                />
                {avatarPreview && (
                  <div className="avatar-preview">
                    <img
                      src={avatarPreview}
                      alt="Avatar Preview"
                      style={{ maxWidth: "100px", maxHeight: "100px" }}
                    />
                  </div>
                )}
              </div>
              <button type="submit">Add User</button>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmationId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirm Delete</h2>
            <p>
              Are you sure you want to delete user with ID:{" "}
              {deleteConfirmationId}?
            </p>
            <div className="confirmation-buttons">
              <button
                onClick={() => handleConfirmDelete(deleteConfirmationId)}
                className="confirm-button"
              >
                Yes, Delete
              </button>
              <button onClick={handleCancelDelete} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserList;
