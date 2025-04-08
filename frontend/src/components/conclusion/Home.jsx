import React from 'react';
import Promo from '../promo/Promo';
import Directions from '../directions/Directions';
import ViewTrainer from '../trainer/ViewTrainer';

function Home() {
    return (
        <div className="home">
            <Promo />
            <Directions />
            <ViewTrainer />
        </div>
    );
}

export default Home;