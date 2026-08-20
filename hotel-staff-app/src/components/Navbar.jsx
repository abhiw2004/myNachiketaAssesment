import { NavLink } from 'react-router-dom';
import '../App.css';

export default function Navbar() {
  return (
    <nav>
      <span>Hotel Staff Manager</span>
      <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
      <NavLink to="/create" className={({ isActive }) => isActive ? 'active' : ''}>Add Staff</NavLink>
      <NavLink to="/update" className={({ isActive }) => isActive ? 'active' : ''}>Update Staff</NavLink>
    </nav>
  );
}
