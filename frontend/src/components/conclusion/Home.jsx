import React from 'react';
import Promo from '../promo/Promo';
import Directions from '../directions/Directions';
import ViewTrainer from '../trainer/ViewTrainer';
import RecentArticles from '../article/RecentArticles';

function Home() {
    return (
        <div className="home">
            <Promo />
            <Directions />
            <RecentArticles />
            <ViewTrainer />
        </div>
    );
}

export default Home;