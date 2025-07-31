// ...existing code...
import './WelcomeBanner.scss';

export const WelcomeBanner = () => {
  return (
    <div className='welcome-banner'>
      <div className='welcome-banner__card bg-gradient'>
        <h1 className='welcome-banner__title'>MF Store</h1>
        <p className='welcome-banner__subtitle'>
          Welcome to the Modern Federated Storefront!
        </p>
      </div>
    </div>
  );
};
