import {Navigation} from 'src/components/Navigation';
import {ProductList} from 'mf_products/components';
import {Footer} from 'src/components/Footer';
import './Home.scss';
import {useDispatch} from 'react-redux';
import {addToCartRequest} from 'mf_cart/cartSlice';
import {Product} from 'mf_products/types';
import {WelcomeBanner} from 'src/components/WelcomeBanner';
const HomePage = () => {
  const dispatch = useDispatch();
  const handleAddToCart = (product: Product) => {
    dispatch(addToCartRequest({product, amount: 1}));
  };
  return (
    <div className='home'>
      <Navigation />
      <WelcomeBanner />
      <ProductList onAddToCart={handleAddToCart} />
      <Footer />
    </div>
  );
};

export default HomePage;
