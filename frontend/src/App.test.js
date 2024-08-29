import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import App from './App';

// Mock axios
jest.mock('axios');

describe('App Component', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    test('renders Task Management title', () => {
        render(<App />);
        const titleElement = screen.getByText(/Task Management/i);
        expect(titleElement).toBeInTheDocument();
    });

    test('renders form inputs and add button', () => {
        render(<App />);
        expect(screen.getByPlaceholderText(/Title/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Description/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add Task/i })).toBeInTheDocument();
    });

    test('fetches and displays tasks', async () => {
        const mockTasks = [
            { id: 1, title: 'Task 1', description: 'Description 1' },
            { id: 2, title: 'Task 2', description: 'Description 2' },
        ];

        axios.get.mockResolvedValueOnce({ data: mockTasks });

        render(<App />);

        await waitFor(() => {
            expect(screen.getByText(/Task 1/i)).toBeInTheDocument();
            expect(screen.getByText(/Task 2/i)).toBeInTheDocument();
        });

        expect(axios.get).toHaveBeenCalledWith('http://localhost:5000/tasks');
    });

    test('adds a new task', async () => {
        axios.post.mockResolvedValueOnce({ data: { id: 3, title: 'New Task', description: 'New Description' } });
        axios.get.mockResolvedValueOnce({ data: [{ id: 3, title: 'New Task', description: 'New Description' }] });

        render(<App />);

        fireEvent.change(screen.getByPlaceholderText(/Title/i), { target: { value: 'New Task' } });
        fireEvent.change(screen.getByPlaceholderText(/Description/i), { target: { value: 'New Description' } });
        fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));

        await waitFor(() => {
            expect(screen.getByText(/New Task/i)).toBeInTheDocument();
            expect(screen.getByText(/New Description/i)).toBeInTheDocument();
        });

        expect(axios.post).toHaveBeenCalledWith('http://localhost:5000/tasks', { title: 'New Task', description: 'New Description' });
    });

    test('deletes a task', async () => {
        const mockTasks = [{ id: 1, title: 'Task to Delete', description: 'Will be deleted' }];
        axios.get.mockResolvedValueOnce({ data: mockTasks });
        axios.delete.mockResolvedValueOnce({});

        render(<App />);

        await waitFor(() => {
            expect(screen.getByText(/Task to Delete/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /Delete/i }));

        await waitFor(() => {
            expect(screen.queryByText(/Task to Delete/i)).not.toBeInTheDocument();
        });

        expect(axios.delete).toHaveBeenCalledWith('http://localhost:5000/tasks/1');
    });
});
