import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import api from '../lib/api';
import { setCredentials, logout, setInitialized } from '../store/authSlice';

export default function AuthInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('rco_token');
    if (!token) {
      // No token: mark initialization complete so sockets can decide to stay disconnected
      dispatch(setInitialized());
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (!mounted) return;
        if (data?.user) {
          dispatch(setCredentials({ user: data.user, token }));
        } else {
          dispatch(logout());
        }
      } catch {
        // Token invalid or network error: clear stored auth
        dispatch(logout());
      } finally {
        // Mark auth bootstrap as finished so SocketProvider can safely connect
        dispatch(setInitialized());
      }
    })();

    return () => { mounted = false; };
  }, [dispatch]);

  return null;
}
