import './fonts/geometria-medium.woff';
import './fonts/geometria-bold.woff';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import Promo from "./components/promo/Promo";
import Users from "./components/users/Users";

import Directions from "./components/directions/Directions";
import DirectionEdit from "./components/directions/DirectionEdit";

import Categories from "./components/categories/Categories";
import Trainer from "./components/trainer/Trainer";
import ViewTrainer from "./components/trainer/ViewTrainer";

import Subscriptions from "./components/subscriptions/Subscriptions";
import AdminPurchaseSubscription from "./components/subscriptions/AdminPurchaseSubscription";

import Schedule from "./components/schedule/Schedule";
import ClientSchedule from "./components/client/schedule/ClientSchedule";
import TrainerSchedule from "./components/trainerview/schedule/TrainerSchedule";

import ArticleEditor from "./components/article/ArticleEditor";
import ArticleList from './components/article/ArticleList';
import ArticleView from './components/article/ArticleView';

import { useEffect, useState } from 'react';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setIsAdmin(user.role === 'admin');
        setCurrentUser(user);
        setIsAuthenticated(true);
      } else {
        setIsAdmin(false);
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    window.addEventListener('authChange', checkAuth);
    return () => window.removeEventListener('authChange', checkAuth);
  }, []);

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Promo />} />
        <Route path="/directions" element={<Directions />} />
        <Route path="/schedule" element={
          currentUser?.role === 'trainer' ? <TrainerSchedule /> :
          currentUser?.role === 'admin' ? <Schedule /> :
          <ClientSchedule />
        } />
        <Route path="/articles" element={<ArticleList />} />
        <Route path="/articles/:id" element={<ArticleView />} />

        {/* Только для администратора */}
        {isAdmin && (
          <>
            <Route path="/admin/view-trainers" element={<ViewTrainer />} />
            <Route path="/admin/direction-edit" element={<DirectionEdit />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/categories" element={<Categories />} />
            <Route path="/admin/trainers" element={<Trainer />} />
            <Route path="/admin/subscriptions" element={<Subscriptions />} />
            <Route path="/admin/purchase-subscription" element={<AdminPurchaseSubscription />} />
            <Route path="/admin/articles/edit" element={<ArticleEditor />} />
          </>
        )}

        {/* Маршрут по умолчанию */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
