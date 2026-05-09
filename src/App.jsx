import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Applications from "./components/Applications";
import { useState, useEffect } from "react";
import Profile from "./components/Profile";
import SignInModal from "./modals/SignInModal";
import SignUpModal from "./modals/SignUpModal";
import { authFetch } from "./helpers/authFetch";
import EditProfileModal from "./modals/EditProfileModal";
import Interviews from "./components/Interviews";

function App() {
  const [search, setSearch] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [user, setUser] = useState(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const getUser = async () => {
    const meRes = await authFetch("http://127.0.0.1:8000/users/me");
    setUser(await meRes.json());
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getUser();
    }
  }, []);


  const onOpenEditProfile = () => {
    setEditProfileOpen(true);
  }

  const onOpenAuth= () => {
    setAuthOpen(true);
    setIsSignUp(false)
  }

  const onSignUp = () => {
    setIsSignUp(true);
    setAuthOpen(false);
  }
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout onOpenAuth={onOpenAuth} search={search} setSearch={setSearch} user={user} setUser={setUser} />}>
          <Route index element={<Dashboard search={search} user={user} />} />
          <Route path="applications" element={<Applications search={search} user={user} />} />
          <Route path="interviews" element={<Interviews search={search} user={user} />} />
          <Route path="profile" element={<Profile user={user} onOpenEditProfile={onOpenEditProfile} />} />
        </Route>
      </Routes>

      {authOpen && <SignInModal onClose={() => setAuthOpen(false)} onSignUp={onSignUp} getUser={getUser} />}
      {isSignUp && <SignUpModal onClose={() => setIsSignUp(false)} onOpenAuth={onOpenAuth} />}
      {editProfileOpen && <EditProfileModal onClose={() => setEditProfileOpen(false)} getUser={getUser} user={user} />}
        

    </BrowserRouter>
  );
}

export default App;