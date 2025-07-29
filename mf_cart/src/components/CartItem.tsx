import {Button} from 'mf_shared_lib/components';
import {CartItem as CartItemType} from '../redux/cart';
export const CartItem = ({item}: {item: CartItemType}) => {
  return (
    <div className='border rounded w-100 h-100 p-2'>
      {item.product.name} - {item.amount} pcs
      <span className='ml-auto'>
        <Button>X</Button>
      </span>
    </div>
  );
};
