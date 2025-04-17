import React from 'react';
import Promo from '../promo/Promo';
import Directions from '../directions/Directions';
import ViewTrainer from '../trainer/ViewTrainer';
import RecentArticles from '../article/RecentArticles';
import TodaySchedule from '../client/schedule/TodaySchedule';
function Home() {
    return (
        <div className="home">
            <Promo />
            <Directions />
            <ViewTrainer />
            <TodaySchedule />
            <RecentArticles />
           
        </div>
    );
}

export default Home;