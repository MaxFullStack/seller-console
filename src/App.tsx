import { RouterProvider, createRouter } from "@tanstack/react-router";
import { ToastContainer } from "react-toastify";
import { routeTree } from "./routeTree.gen";
import { ThemeProvider, useTheme } from "@/components/theme-provider";

import "react-toastify/dist/ReactToastify.css";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const AppContent = () => {
  const { theme } = useTheme();

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={6000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme === "light" ? "light" : "dark"}
      />
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="seller-console-ui-theme">
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
