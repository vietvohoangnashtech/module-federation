import {render, screen} from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Replace with actual text from your App component
    expect(screen.getByText(/app/i)).toBeInTheDocument();
  });
});
