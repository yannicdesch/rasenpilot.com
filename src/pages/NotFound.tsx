import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Leaf } from "lucide-react";
import MainNavigation from "@/components/MainNavigation";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/blog-overview');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50">
      <MainNavigation />
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <Leaf className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-2">
            Diese Seite wurde nicht gefunden
          </p>
          <p className="text-muted-foreground mb-8">
            Du wirst in <span className="font-semibold text-green-600">{countdown}</span> Sekunden zum Ratgeber weitergeleitet…
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate('/blog-overview')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Zum Ratgeber
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="border-green-200 hover:bg-green-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zur Startseite
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
