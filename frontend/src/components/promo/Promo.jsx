import './promo.css'
import promoImg from '/img/promo/promo.png'
const Promo = () => {
    return (  
        <section className="promo">
            <div className="container">
                <div className="promo_content">
                    <div className="promo_text">МЕСТО, ГДЕ ТЫ ПОЛЮБИШЬ КОМФОРТНЫЙ СПОРТ</div>
                    <div className="promo_img">
                        <img src={promoImg} alt="" />
                    </div>
                </div>
            </div>
        </section>

    );
}
 
export default Promo;