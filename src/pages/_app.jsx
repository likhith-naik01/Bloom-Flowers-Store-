import '../styles/globals.css';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import { ShopProvider } from '../context/ShopContext';

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
