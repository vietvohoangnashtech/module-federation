import {Link} from 'mf_shared_lib/components';
import {X} from 'mf_shared_lib/icons';
import {CartItem as CartItemType} from '../redux/cart';
import {useAppDispatch} from 'mf_shared_lib/redux';
import {removeFromCartRequest} from '../redux/cart/cartSlice';
export const CartItem = ({item}: {item: CartItemType}) => {
  const dispatch = useAppDispatch();
  return (
    <div className='card container'>
      <div className='card-body row align-items-center pr-0'>
        <span className='col'>
          {item.product.name} - {item.amount} pcs
        </span>
        <span className='col-auto'>
          <Link
            onClick={() =>
              dispatch(removeFromCartRequest({productId: item.product.id}))
            }
          >
            <X size={16} />
          </Link>
        </span>
      </div>
    </div>
  );
};
