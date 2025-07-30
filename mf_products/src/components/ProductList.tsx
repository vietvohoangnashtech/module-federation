import {useAppDispatch, useSafeSliceSelector} from 'mf_shared_lib/redux';
import {loadProductsRequest, Product, ProductState} from '../redux/product';
import {useEffect} from 'react';
import {LoadingSpinner} from 'mf_shared_lib/components';
import {shallowEqual} from 'react-redux';
import {ProductCard} from './ProductCard';

export const ProductList = ({onAddToCart}: {onAddToCart: (product: Product) => void}) => {
  const dispatch = useAppDispatch();
  const {products, loading} = useSafeSliceSelector(
    'product',
    (state: ProductState) => ({
      products: state.products,
      loading: state.loading,
    }),
    {products: [], loading: false},
    shallowEqual
  );
  useEffect(() => {
    dispatch(loadProductsRequest());
  }, [dispatch]);
  if (loading) {
    return <LoadingSpinner />;
  }
  return (
    <div className="container w-100 m-0">
      <div className="row w-100">
        {products.map((product) => {
          return (
            <div className="col-md-4" key={product.id}>
              <ProductCard product={product} onAddToCart={onAddToCart} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
