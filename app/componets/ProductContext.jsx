// ProductContext.jsx
import { createContext, useContext, useState } from "react";

const ProductContext = createContext();

export function ProductProvider({ children, initialProducts }) {
  const [products, setProducts] = useState(
    initialProducts || {
      productsWithMetafield: [],
      productsWithoutMetafield: []
    }
  );

  return (
    <ProductContext.Provider value={{ products, setProducts }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);
