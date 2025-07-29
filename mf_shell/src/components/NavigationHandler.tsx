import {useNavigate} from 'react-router-dom';
import {useAppDispatch, useEnhancedSelector} from 'mf_shared_lib/redux';
import {useEffect} from 'react';
import {clearNavigation} from 'mf_shared_lib/navigationSlice';

const NavigationHandler = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Use enhanced selector for navigation (always available)
  const pendingNavigation = useEnhancedSelector(
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
