import {Navigation} from 'src/components/Navigation';
import {ProductList} from 'mf_products/components';
import {Footer} from 'src/components/Footer';
import './Home.scss';
const HomePage = () => {
  return (
    <div className='home'>
      <Navigation />
      <h1>Welcome to the Home Page</h1>
      <p>This is the main page of the application.</p>
      <h1>New Products</h1>
      <ProductList />
      <h1>Featured Products</h1>
      <ProductList />
      <h1>Best Sellers</h1>
      <ProductList />
      <Footer />
    </div>
  );
};

export default HomePage;
