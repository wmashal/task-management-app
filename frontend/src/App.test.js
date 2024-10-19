import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import App from './App';
jest.mock('axios');
describe('App Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    test('renders Task Management title', () => {
        render(<App />);
        const titleElement = screen.getByText(/Task Management/i);
        expect(titleElement).toBeInTheDocument();
    });
    test('fetches and displays tasks', async () => {
        const mockTasks = [
            { id: 1, title: 'Task 1', description: 'Description 1' },
            { id: 2, title: 'Task 2', description: 'Description 2' },
        ];
        axios.get.mockResolvedValueOnce({ data: mockTasks });
        render(<App />);
        await waitFor(() => expect(screen.getByText(/Task 1/i)).toBeInTheDocument())
            expect(screen.getByText(/Task 2/i)).toBeInTheDocument();
        expect(axios.get).toHaveBeenCalledWith('http://backend:5000/tasks');
    });
    test('adds a new task', async () => {
        axios.post.mockResolvedValueOnce({ data: { id: 3, title: 'New Task', description: 'New Description' } });
        axios.get.mockResolvedValueOnce({ data: [{ id: 3, title: 'New Task', description: 'New Description' }] });
        render(<App />);
        fireEvent.change(screen.getByPlaceholderText(/Title/i), { target: { value: 'New Task' } });
        fireEvent.change(screen.getByPlaceholderText(/Description/i), { target: { value: 'New Description' } });
        fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));
        await waitFor(() =>
            expect(screen.getByText(/New Task/i)).toBeInTheDocument())
            expect(screen.getByText(/New Description/i)).toBeInTheDocument();
        expect(axios.post).toHaveBeenCalledWith('http://backend:5000/tasks', { title: 'New Task', description: 'New Description' });
    });
});
