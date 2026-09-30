import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <AppRoutes />
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}