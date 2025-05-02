import './styles/common.css';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import Promo from "./components/promo/Promo";
import Users from "./components/users/Users";
import Home from "./components/conclusion/Home";
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

import TrainerProfile from './components/profile/trainer/TrainerProfile';
import ClientProfile from './components/profile/client/ClientProfile';
import AdminProfile from './components/profile/admin/AdminProfile';

// Компонент для защиты маршрутов
const ProtectedRoute = ({ children, isAllowed, redirectPath = "/" }) => {
  console.log('ProtectedRoute check:', { isAllowed });
  
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }
  return children;
};

// Компонент для ожидания загрузки
const LoadingRoute = () => {
  return <div className="loading">Загрузка...</div>;
};

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      setIsLoading(true);
      const savedUser = localStorage.getItem('currentUser');
      console.log('Checking auth, saved user:', savedUser);
      
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          console.log('Parsed user:', user);
          setIsAdmin(user.role === 'admin');
          setCurrentUser(user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('currentUser');
          setIsAdmin(false);
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setIsAdmin(false);
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();

    window.addEventListener('authChange', checkAuth);
    return () => window.removeEventListener('authChange', checkAuth);
  }, []);

  if (isLoading) {
    return (
      <Router>
        <Header />
        <LoadingRoute />
        <Footer />
      </Router>
    );
  }

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/directions" element={<Directions />} />
        <Route path="/schedule" element={
          currentUser?.role === 'trainer' ? <TrainerSchedule /> :
          currentUser?.role === 'admin' ? <Schedule /> :
          <ClientSchedule />
        } />
        <Route path="/articles" element={<ArticleList />} />
        <Route path="/articles/:id" element={<ArticleView />} />

        {/* Профили пользователей */}
        <Route path="/profile/trainer" element={
          <ProtectedRoute isAllowed={isAuthenticated && currentUser?.role === 'trainer'}>
            <TrainerProfile />
          </ProtectedRoute>
        } />
        <Route path="/profile/client" element={
          <ProtectedRoute isAllowed={isAuthenticated}>
            <ClientProfile />
          </ProtectedRoute>
        } />
        <Route path="/profile/admin" element={
          <ProtectedRoute isAllowed={isAuthenticated && currentUser?.role === 'admin'}>
            <AdminProfile />
          </ProtectedRoute>
        } />

        {/* Только для администратора */}
        <Route path="/admin/view-trainers" element={
          <ProtectedRoute isAllowed={isAuthenticated && isAdmin}>
            <ViewTrainer />
          </ProtectedRoute>
        } />
        <Route path="/admin/direction-edit" element={
          <ProtectedRoute isAllowed={isAuthenticated && isAdmin}>
            <DirectionEdit />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute isAllowed={isAuthenticated && isAdmin}>
            <Users />
          </ProtectedRoute>
        } />
        <Route path="/admin/categories" element={
          <ProtectedRoute isAllowed={isAuthenticated && isAdmin}>
            <Categories />
          </ProtectedRoute>
        } />
        <Route path="/admin/trainers" element={
          <ProtectedRoute isAllowed={isAuthenticated && isAdmin}>
            <Trainer />
          </ProtectedRoute>
        } />
        <Route path="/admin/subscriptions" element={
          <ProtectedRoute isAllowed={isAuthenticated && isAdmin}>
            <Subscriptions />
          </ProtectedRoute>
        } />
        <Route path="/admin/purchase-subscription" element={
          <ProtectedRoute isAllowed={isAuthenticated && isAdmin}>
            <AdminPurchaseSubscription />
          </ProtectedRoute>
        } />
        <Route path="/admin/articles/edit" element={
          <ProtectedRoute isAllowed={isAuthenticated && isAdmin}>
            <ArticleEditor />
          </ProtectedRoute>
        } />

        {/* Маршрут по умолчанию */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
