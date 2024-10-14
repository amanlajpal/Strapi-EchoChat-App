import { useDispatch, useSelector } from "react-redux";
import Auth from "./pages/Auth";
import ChatWindow from "./pages/ChatWindow";
import "./styles/App.css";
import { setIsAuthenticated } from "./redux/slices/authSlice";
import { useEffect } from "react";

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state?.auth?.value?.isAuthenticated);
  useEffect(() => {
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
      dispatch(setIsAuthenticated(true));
    } else {
      dispatch(setIsAuthenticated(false));
    }
  }, []);
  return (
    <>
      {isAuthenticated ? <ChatWindow /> : <Auth />}
    </>
  );
}

export default App;
