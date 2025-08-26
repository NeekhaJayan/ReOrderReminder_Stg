import { useEffect,useState,useCallback,useMemo } from "react";
import { useOutletContext } from '@remix-run/react';
import {groupVariantsByProduct} from '../utils/shopify';
import { useProducts } from "../componets/ProductContext";

export function useProductsWithoutEUD(fetcher) {
    const { plan,shopID,bufferTime,templateId,logo,coupon,discount } = useOutletContext();
    const {products, setProducts } = useProducts();
    const [taggedWith, setTaggedWith] = useState('VIP');
    const [queryValue, setQueryValue] = useState(undefined);
    const [formState, setformState] = useState({});
    const [banner, setBanner] = useState(null);
    const resourceName = {
    singular: 'product',
    plural: 'products',
  };

  const headings = [
    { title: "" },
    { title: "Days Product Lasts" },
    { title: "" },
  ];

  const getFilteredItems = useCallback((items) => {
        
        if (!queryValue || queryValue.trim() === '') {
            return items;
        }

        return items.filter(item => {
            const matchesTag = taggedWith
            ? item.tags?.some(tag => tag.toLowerCase().includes(taggedWith.toLowerCase()))
            : true;

            const matchesQuery = queryValue
            ? item.productTitle?.toLowerCase().includes(queryValue.toLowerCase())
            : true;

            return matchesQuery;
        });
    }, [taggedWith, queryValue]);

    const groupedProducts = useMemo(() => {
      const grouped = groupVariantsByProduct(products.productsWithoutMetafield || []);
      return getFilteredItems(grouped);
    }, [products.productsWithoutMetafield, getFilteredItems]);

    const allVariantRows = useMemo(() => {
    return groupedProducts.flatMap((product) =>
      product.variants.map((variant) => ({
        ...variant,
        productTitle: product.productTitle,
        productImage: product.productImage,
        shopify_product_id: product.shopify_product_id,
        id: variant.shopify_variant_id,
      }))
    );
  }, [groupedProducts]);
    
 useEffect(() => {
    if (fetcher?.data?.success || fetcher?.data?.error) {
    setBanner(fetcher.data);
    const timer = setTimeout(() => setBanner(null), 3000);
    // Cleanup the timer when the component unmounts or the effect re-runs
    return () => clearTimeout(timer);
  }
  }, [fetcher?.data]);


 // Keep both dependencies
    
    
    const handleChange = (variantId) => (value) => {
      setformState((prev) => ({
        ...prev,
        [variantId]: value,
      }));
    };
    
    const handleSave = (productId, variantId,title,imageurl) => {

      const days = formState[variantId];
      const formData = new FormData();
      formData.append("shopId",shopID)
      formData.append("productId", productId);
      formData.append("productVariantId", variantId);
      formData.append("productImage",imageurl);
      formData.append("productTitle",title);
      formData.append("reorder_days", days);
      fetcher.submit(formData, { method: "post", action: "/app/myproducts" });
      setformState(prev => {
        const copy = { ...prev };
        delete copy[variantId];
        return copy;
      });
  };
    
    
    
    
    return {groupedProducts,allVariantRows,headings,resourceName,formState,handleChange,handleSave,fetcher,
    banner,
    loading: fetcher?.state !== "idle"}
}