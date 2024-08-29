// frontend/src/App.test.js
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders welcome message', () => {
    render(<App />);
    const welcomeElement = screen.getByText(/Welcome to Our E-commerce Store/i);
    expect(welcomeElement).toBeInTheDocument();
});