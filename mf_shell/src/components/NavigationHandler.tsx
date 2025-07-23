import {useNavigate} from 'react-router-dom';
import {useAppDispatch, useAppSelector} from 'mf_shared_lib/redux';
import {useEffect} from 'react';
import {clearNavigation} from 'mf_shared_lib/navigationSlice';
const NavigationHandler = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const pendingNavigation = useAppSelector(
    (state) => state.navigationReducer.pendingNavigation
  );

  useEffect(() => {
    if (pendingNavigation) {
      navigate(pendingNavigation.path, {replace: pendingNavigation.replace});
      dispatch(clearNavigation());
    }
  }, [pendingNavigation, navigate, dispatch]);

  return null;
};

export default NavigationHandler;
