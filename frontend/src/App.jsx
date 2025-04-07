import './fonts/geometria-medium.woff';
import './fonts/geometria-bold.woff';
import Header from "./components/header/Header";
import Directions from "./components/directions/Directions";
import Promo from "./components/promo/Promo";
import Footer from "./components/footer/Footer";
import Users from "./components/users/Users";
import Categories from "./components/categories/Categories";
import DirectionEdit from "./components/directions/DirectionEdit";
import Trainer from "./components/trainer/Trainer";
import ViewTrainer from "./components/trainer/ViewTrainer";
import { useState, useEffect } from "react";
import Subscriptions from "./components/subscriptions/Subscriptions";
import AdminPurchaseSubscription from "./components/subscriptions/AdminPurchaseSubscription";
import Schedule from "./components/schedule/Schedule";
import ClientSchedule from "./components/client/schedule/ClientSchedule";
import TrainerSchedule from "./components/trainerview/schedule/TrainerSchedule";
import ArticleEditor from "./components/article/ArticleEditor";
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

    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('authChange', handleAuthChange);
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  // Компоненты для обычного пользователя
  const userComponents = (
    <>
      <Header />
      <Promo />
      <Directions />
      <ClientSchedule />
      <Footer />
    </>
  );

  // Компоненты для администратора
  const adminComponents = (
    <>
      <Header />
      <Promo />
      <ViewTrainer />
      <Directions />
      <DirectionEdit />
      <Users />
      <Categories />
      <Trainer />
      <Subscriptions />
      <AdminPurchaseSubscription />
      <Schedule />
      <ArticleEditor />
      <Footer />
    </>
  );

  const trainerComponents = (
    <>
      <Header />
      <Promo />
      <TrainerSchedule />
      <Footer />
    </>
  );

  return (
    <>
      {isAuthenticated && currentUser ? (
        isAdmin ? adminComponents : 
        currentUser.role === 'trainer' ? trainerComponents : 
        userComponents
      ) : (
        // Если пользователь не авторизован, показываем базовые компоненты
        <> 
          <Users />
          <Header />
          <Promo />
          <Footer />
        </>
      )}
    </>
  );
}

export default App
