import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/authSlice';
import { useSocketStatus } from '../context/SocketContext';

export default function AuthGuard({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const socketStatus = useSocketStatus();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but socket is not connected yet, show a friendly connecting screen
  if (isAuthenticated && socketStatus !== 'connected') {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-bg-primary text-text-muted">
        <div className="text-center">
          <div className="mb-4 text-lg font-semibold">Connecting to server...</div>
          <div className="text-sm">We are establishing a live connection. This may take a few seconds.</div>
        </div>
      </div>
    );
  }

  return children;
}
