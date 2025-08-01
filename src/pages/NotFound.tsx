
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-700 mb-4">404</h1>
        <p className="text-xl text-green-600 mb-4">Oops! Page not found</p>
        <Link to="/" className="text-green-500 hover:text-green-700 underline">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
