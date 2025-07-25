import {
  Button,
  Dialog,
  DialogTrigger,
  Link,
  Modal,
  NavigationBar,
  Popover,
} from 'mf_shared_lib/components';
import {requestNavigation} from 'mf_shared_lib/navigationSlice';
import {useAppDispatch, useAppSelector} from 'mf_shared_lib/redux';
import './Navigation.scss';
import {ExtendedRootState} from 'src/redux/types';
import {logout} from 'mf_user/authSlice';
import {Login} from 'mf_user/components';
import {ShoppingCart} from 'mf_shared_lib/icons';
import {CartPreview} from 'mf_cart/components';
export const Navigation = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: ExtendedRootState) => state.auth?.user);
  const navigate = (path?: string) => {
    dispatch(requestNavigation({path: path || '/', replace: false}));
  };
  return (
    <NavigationBar className='navbar navbar-expand-lg navbar-dark bg-dark p-3'>
      <div className='d-flex justify-content-between w-100'>
        <Link onClick={() => navigate('/')}>
          <h3>MF SHOP</h3>
        </Link>
        <div>
          <span className='nav-item'>
            <DialogTrigger>
              <Link>
                <ShoppingCart />
              </Link>
              <Popover>
                <CartPreview />
              </Popover>
            </DialogTrigger>
          </span>
          <span className='nav-item'>
            {user ? (
              <Link onClick={() => dispatch(logout())}>Logout</Link>
            ) : (
              <DialogTrigger>
                <Link>Login</Link>
                <Modal isDismissable>
                  <Dialog>
                    <div className='d-flex justify-content-end mb-2'>
                      <Button slot='close'>
                        <small>X</small>
                      </Button>
                    </div>
                    <Login />
                  </Dialog>
                </Modal>
              </DialogTrigger>
            )}
          </span>
        </div>
      </div>
    </NavigationBar>
  );
};
