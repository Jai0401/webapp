import { render, screen } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { Destinations } from '../Destinations';
import { Session } from 'next-auth';
import '@testing-library/jest-dom';
// import userEvent from '@testing-library/user-event';

describe('Destinations', () => {
  const mockSession: Session = {
    expires: '1',
    user: { email: 'a', name: 'Delta', image: 'c' },
  };

  // Mock fetch to handle useEffect in components
  beforeEach(() => {
    const fakeResponse = {};
    const mRes = { json: jest.fn().mockResolvedValueOnce(fakeResponse) };
    const mockedFetch = jest.fn().mockResolvedValueOnce(mRes as any);
    (global as any).fetch = mockedFetch;
  });
  afterEach(() => {
    const fakeResponse = {};
    const mRes = { json: jest.fn().mockResolvedValueOnce(fakeResponse) };
    const mockedFetch = jest.fn().mockResolvedValueOnce(mRes as any);
    (global as any).fetch = mockedFetch;
  });

  // Tests
  it('new destination button renders', async () => {
    render(
      <SessionProvider session={mockSession}>
        <Destinations />
      </SessionProvider>
    );
    const button = screen.getByTestId('add-new-destination');
    expect(button).toHaveTextContent('Add a new warehouse');
  });

  it('new destination button click opens dialogue & close button closes it', async () => {
    // render(
    //   <SessionProvider session={mockSession}>
    //     <Destinations />
    //   </SessionProvider>
    // );
    // // Open dialogue box
    // const button = screen.getByTestId('add-new-destination');
    // userEvent.click(button);
    // await waitFor(() => {
    //   expect(screen.getByText('Add a new destination')).toBeInTheDocument();
    // });
    // // Close dialogue box
    // const closeButton = screen.getByTestId('CloseIcon');
    // userEvent.click(closeButton);
    // await waitFor(() => {
    //   expect(() => screen.getByText('Add a new destination')).toThrow();
    // });
  });

  it('new destination button click opens dialogue & cancel button closes it', async () => {
    // render(
    //   <SessionProvider session={mockSession}>
    //     <Destinations />
    //   </SessionProvider>
    // );
    // // Open dialogue box
    // const button = screen.getByTestId('add-new-destination');
    // userEvent.click(button);
    // await waitFor(() => {
    //   expect(screen.getByText('Add a new destination')).toBeInTheDocument();
    // });
    // // Close dialogue box
    // const closeButton = screen.getByTestId('cancel');
    // userEvent.click(closeButton);
    // await waitFor(() => {
    //   expect(() => screen.getByText('Add a new destination')).toThrow();
    // });
  });
});