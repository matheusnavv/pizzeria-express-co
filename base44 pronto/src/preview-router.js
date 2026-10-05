import React, { useState, useEffect } from 'react';

export const useNavigate = () => {
  return (to) => {
    if (typeof to === 'string') {
      window.location.hash = to;
    }
  };
};

export const useLocation = () => {
  const [hash, setHash] = useState(typeof window !== 'undefined' ? window.location.hash || '#/' : '#/');
  useEffect(() => {
    const onHash = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const pathname = hash.replace(/^#/, '') || '/';
  return { pathname, hash };
};

export const useNavigationType = () => 'PUSH';

export const BrowserRouter = ({ children }) => children;

export const Routes = ({ children }) => {
  const loc = useLocation();
  const childrenArray = React.Children.toArray(children);
  const matched = childrenArray.find((child) => child.props?.path === loc.pathname);
  if (matched) return matched;
  const root = childrenArray.find((child) => child.props?.path === '/');
  return root || childrenArray[0] || null;
};

export const Route = ({ element }) => element || null;
