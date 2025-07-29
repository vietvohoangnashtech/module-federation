import {CartItem} from './CartItem';
import {CartState} from '../redux/cart';
import {useSafeSliceSelector} from 'mf_shared_lib/redux';

export const CartPreview = () => {
  const cartItems = useSafeSliceSelector(
    'cart',
    (cart: CartState) => cart.items,
    []
  );
  if (cartItems.length === 0) {
    return <div className='p-2'>Your cart is empty</div>;
  }
  return (
    <div>
      {cartItems.map((item, i) => (
        <CartItem key={i} item={item} />
      ))}
    </div>
  );
};
