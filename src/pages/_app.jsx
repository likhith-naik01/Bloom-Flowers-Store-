import '../frontend/styles/globals.css';
import { CartProvider } from '../frontend/context/CartContext';
import { AuthProvider } from '../frontend/context/AuthContext';
import { ShopProvider } from '../frontend/context/ShopContext';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <ShopProvider>
        <CartProvider>
          <Component {...pageProps} />
        </CartProvider>
      </ShopProvider>
    </AuthProvider>
  );
}
