import './styles/LoadingSpinner.scss';

export const LoadingSpinner = () => {
  return (
    <div className='loading-spinner'>
      <div className='spinner-border' role='status'>
        <span className='visually-hidden'>Loading...</span>
      </div>
    </div>
  );
};
