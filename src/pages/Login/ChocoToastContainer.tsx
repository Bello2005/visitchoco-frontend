import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function ChocoToastContainer() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3500}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      transition={Slide}
      style={{ width: "90vw", maxWidth: 400 }}
      toastStyle={{
        fontSize: "1.1rem",
        borderRadius: 12,
        minWidth: 200,
        maxWidth: "90vw",
      }}
    />
  );
}
