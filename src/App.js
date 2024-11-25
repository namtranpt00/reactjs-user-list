import React, { Component } from "react";
import axios from "axios";
import "./App.css"; // Import custom CSS file

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: []
    };
  }

  componentDidMount() {
    axios
      .get("https://66a39c4e44aa63704581e216.mockapi.io/api/v1/users")
      .then(res => {
        this.setState({ users: res.data });
      })
      .catch(err => {
        console.error(err);
      });
  }

  render() {
    const { users } = this.state;
    return (
      <div className="app-container">
        <h1 className="title">User List</h1>
        <ul className="user-list">
          {users.map(user => (
            <li key={user.id} className="user-card">
              <div className="user-avatar">
                <img src={user.avatar} alt={`${user.name}'s avatar`} />
              </div>
              <div className="user-info">
                <h2>{user.name}</h2>
                <p>ID: {user.id}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default App;
