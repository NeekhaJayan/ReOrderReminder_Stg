import { useEffect,useState,useCallback } from "react";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {groupVariantsByProduct} from '../utils/shopify';
import { useProducts } from "../componets/ProductContext";

export function useProductsWithoutEUD(fetcher) {
    const {shopID,bufferTime,templateId,logo,coupon,discount}=useLoaderData();
    const {products, setProducts } = useProducts();
    const productsWithoutMetafield = products.filter(
  p => p.variants.some(v => !v.reorder_days)
);
    const [taggedWith, setTaggedWith] = useState('VIP');
    const [queryValue, setQueryValue] = useState(undefined);
    const [formState, setformState] = useState({});
    const [banner, setBanner] = useState(null);
    const resourceName = {
    singular: 'product',
    plural: 'products',
  };

  const headings = [
    { title: "Product / Variant" },
    { title: "Estimated Usage Days" },
    { title: "Action" },
  ];

  useEffect(() => {
    if (fetcher?.data?.success || fetcher?.data?.error) {
      setBanner(fetcher.data);
      const timer = setTimeout(() => setBanner(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [fetcher?.data]);

  useEffect(() => {
  if (fetcher?.data?.result) {
    
    setProducts(prev =>
      prev.map(p =>
        p.id === fetcher.data.result.shopify_product_id
          ? {
              ...p,
              variants: p.variants.map(v =>
                v.id === fetcher.data.result.shopify_variant_id
                  ? { ...v, reorder_days: fetcher.data.result.reorder_days }
                  : v
              )
            }
          : p
      )
    );
  }
}, [fetcher?.data, setProducts]);
    
    const groupedPending = groupVariantsByProduct(productsWithoutMetafield);
    
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
      console.log("JSUsageDays:",days)
      fetcher.submit(formData, { method: "post", action: "/app/myproducts" });
    };
    
    
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

    const filteredItems = getFilteredItems(groupedPending);
    const allVariantRows = filteredItems.flatMap((product) =>
        product.variants.map((variant) => ({
          id: variant.id,
          disabled: false,
        }))
      );
    


    return {groupedPending,headings,resourceName,formState,handleChange,handleSave,filteredItems,allVariantRows,fetcher,
    banner,
    loading: fetcher?.state !== "idle"}
}