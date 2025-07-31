import {CartItem} from './CartItem';
import {CartState} from '../redux/cart';
import {useSafeSliceSelector} from 'mf_shared_lib/redux';
import {Button} from 'mf_shared_lib/components';

export const CartPreview = ({showCheckout}: {showCheckout: boolean}) => {
  const cartItems = useSafeSliceSelector(
    'cart',
    (cart: CartState) => cart.items,
    []
  );
  if (cartItems.length === 0) {
    return <div className='p-2'>Your cart is empty</div>;
  }
  return (
    <div className='d-flex gap-2 flex-column'>
      {cartItems.map((item, index) => (
        <CartItem key={index} item={item} />
      ))}
      <div className='d-flex justify-content-between'>
        <strong>Total:</strong>
        <span>
          {cartItems.reduce(
            (total, item) => total + item.product.price * item.amount,
            0
          )}{' '}
          USD
        </span>
      </div>
      {showCheckout && (
        <div className='d-flex justify-content-end'>
          <Button>Checkout</Button>
        </div>
      )}
    </div>
  );
};
