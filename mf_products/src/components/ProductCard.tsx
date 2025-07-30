import {Button} from 'mf_shared_lib/components';
import {Product} from '../redux/product';
import {ShoppingCart} from 'mf_shared_lib/icons';
import './ProductCard.css';
export const ProductCard = ({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart: (product: Product) => void;
}) => {
  return (
    <div className="card mb-4">
      <img src={product.imageUrl} className="card-img-top" alt={product.name} />
      <div className="card-body">
        <h5 className="card-title">{product.name}</h5>
        <p className="card-text">{product.description}</p>
        <div className="row">
          <div className="col">
            <h4 className="card-text">${product.price.toFixed(2)}</h4>
          </div>
          <div className="col-auto">
            <Button onClick={() => onAddToCart(product)}>
              <ShoppingCart />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
