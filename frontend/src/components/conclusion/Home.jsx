import React from 'react';
import Promo from '../promo/Promo';
import Directions from '../directions/Directions';
import ViewTrainer from '../trainer/ViewTrainer';
import RecentArticles from '../article/RecentArticles';
import TodaySchedule from '../client/schedule/TodaySchedule';
import ClientSubscriptions from '../subscriptions/ClientSubscriptions';
function Home() {
    return (
        <div className="home">
            <Promo />
            <Directions />
            <ViewTrainer />
            <TodaySchedule />
            <RecentArticles />
            <ClientSubscriptions />
           
        </div>
    );
}

export default Home;