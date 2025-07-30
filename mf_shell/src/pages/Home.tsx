import {Navigation} from 'src/components/Navigation';
import {ProductList} from 'mf_products/components';
import {Footer} from 'src/components/Footer';
import './Home.scss';
import {useDispatch} from 'react-redux';
import {addToCartRequest} from 'mf_cart/cartSlice';
import {Product} from 'mf_products/types';
const HomePage = () => {
  const dispatch = useDispatch();
  const handleAddToCart = (product: Product) => {
    dispatch(addToCartRequest({product, amount: 1}));
  };
  return (
    <div className='home'>
      <Navigation />
      <h1>Welcome to the Home Page</h1>
      <p>This is the main page of the application.</p>
      <h1>New Products</h1>
      <ProductList onAddToCart={handleAddToCart} />
      <Footer />
    </div>
  );
};

export default HomePage;
