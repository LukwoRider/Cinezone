import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import MovieForm from "./pages/MovieForm.jsx";
import MovieDetails from "./pages/MovieDetails.jsx";
import "../src/styles/App.css";
import Header from "./components/Header";
import Categories from "./pages/Categories.jsx";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminMovies from "./pages/admin/AdminMovies.jsx";
import AdminCategories from "./pages/admin/AdminCategories.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="app">
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/add" element={<MovieForm />} />
        <Route path="/movies/:id/edit" element={<MovieForm />} />
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/movies" element={<AdminMovies />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/users" element={<AdminUsers />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
