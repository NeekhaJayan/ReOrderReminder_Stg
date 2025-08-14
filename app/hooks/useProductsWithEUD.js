import { useState, useEffect, useCallback,useLayoutEffect } from "react";
import { useFetcher, useLoaderData ,useSearchParams} from "@remix-run/react";
import { useOutletContext } from '@remix-run/react';
import {getAllProducts,groupVariantsByProduct} from '../utils/shopify';
import { useProducts } from "../componets/ProductContext";

export function useProductsWithEUD(fetcher) {
    const {products,shopID,bufferTime,templateId,logo,coupon,discount}=useLoaderData();
    const { setProducts } = useProducts();
    const groupedConfigured = groupVariantsByProduct(products);
    const normalizedAndFiltered = groupedConfigured.filter(product => 
    product && Array.isArray(product.variants) && product.variants.length > 0
        );
    const [productsWithEUD, setProductsWithEUD] = useState(normalizedAndFiltered);
    const tabs = [
    { id: 'without-eud', content: 'Needs Setup', panelID: 'missing-eud' },
    { id: 'with-eud', content: 'Reorder Ready', panelID: 'with-eud' },
  ];
    const [selectedTab, setSelectedTab] = useState(0);
    const [reorderState, setReorderState] = useState({});
    const [editingProduct, setEditingProduct] = useState(null);
    const [spinner,setSpinner]=useState(false);
    const [bannerWithEUD, setBannerWithEUD] = useState(null);
    const [editWarningMessages, setEditWarningMessages] = useState({});
    // For confirm reset modal
    const [activeModal, setActiveModal] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [selectedVariantId, setSelectedVariantId] = useState(null);

    useEffect(() => {
    if (fetcher?.data?.success || fetcher?.data?.error) {
      setBannerWithEUD(fetcher.data);
      const timer = setTimeout(() => setBannerWithEUD(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [fetcher?.data]);

    useEffect(() => {
        if (fetcher.data?.result) {
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
    }, [fetcher.data, setProducts]);

    useEffect(() => {
    if (fetcher.state === "submitting" || fetcher.state === "loading") {
      setSpinner(true);
    } else {
      setSpinner(false);
    }
  }, [fetcher.state]);

    const handleReorderChange = (variantId, value) => {
        setReorderState((prev) => ({
            ...prev,
            [variantId]: value,
        }));
    };

    const editReorderDay = useCallback((variantId, reorderValue) => {
         // track which variant is being edited

        setReorderState((prev) => ({
            ...prev,
            [variantId]: reorderValue || '',
        }));
        setEditingProduct(variantId);
        }, []);

    const onCancel = (variantId) => {
        setEditingProduct(null); // Exit editing mode

        setReorderState((prev) => {
            const copy = { ...prev };
            delete copy[variantId]; // Clear typed value
            return copy;
        });
        setEditWarningMessages((prev) => {
        const copy = { ...prev };
        delete copy[variantId];   //Clear Inline Error
        return copy;
    });
    };

    const saveReorderDay = useCallback(
        (product_id,variant_id,reorder_days) => {

       if (!reorder_days) {
             setEditWarningMessages(prev => ({
                        ...prev,
                        [variant_id]: "Please enter the estimated usage days."
                    }));
            return;
            }
        if (reorder_days<= bufferTime) {
            setEditWarningMessages(prev => ({
                ...prev,
                [variant_id]: `Usage days must be more than ${bufferTime} (Buffer Time).`
            }));
            return;
            }
        setSpinner(true);
        const formData = new FormData();
        formData.append("shopId", shopID);
        formData.append("productId", product_id);
        formData.append("productVariantId", variant_id); 
        formData.append("reorder_days", reorder_days);
        formData.append("type", "product_update");
        console.log("JSUsageDays:",reorder_days);
        fetcher.submit(formData, { method: "patch" });
        setProductsWithEUD(prev =>
            prev.map(product => ({
            ...product,
            variants: product.variants.map(v =>
                v.shopify_variant_id === variant_id
                ? { ...v, reorder_days }
                : v
            ),
            }))
        );
        setEditingProduct(null);
        setReorderState(prev => {
            const copy = { ...prev };
            delete copy[variant_id];
            return copy;
        });
        setEditWarningMessages(prev => {
            const copy = { ...prev };
            delete copy[variant_id];
            return copy;
        });
    },
        [bufferTime, fetcher, shopID]
    );
    
    const toggleModal = useCallback(() => {
                setActiveModal((prev) => !prev);
                
            }, []);
    const confirmReset = useCallback((productId,variantId) => {
            setSelectedProductId(productId);
            setSelectedVariantId(variantId);
            toggleModal(); // Open the modal
            }, [toggleModal]);

    const resetReorderfield = useCallback((product_id,variant_id) => {
    
        const formData = new FormData();
        formData.append("shopId", shopID);
        formData.append("productId", product_id);
        formData.append("productVariantId", variant_id); 
        formData.append("reorder_days", null);
        formData.append("type", "product_reset");
        setSpinner(true);
        fetcher.submit(formData, { method: "patch" });
        setProductsWithEUD(prev =>
                prev
                .map(product => ({
                    ...product,
                    variants: product.variants.filter(
                    v => v.shopify_variant_id !== selectedVariantId
                    )
                }))
                .filter(product => product.variants.length > 0) // remove product if no variants left
            );
                
                setEditingProduct(null);
                setSelectedProductId(null);
                setSelectedVariantId(null);
                setActiveModal(false);
            }, [fetcher, shopID, selectedProductId, selectedVariantId]);
        
   // Handle change in reorder_days field
    const [activeEmailModal, setActiveEmailModal] = useState(false);  
    const [isFetchingEmailCount, setIsFetchingEmailCount] = useState(false); 
    const [scheduleEmailCount, setScheduleEmailCount] = useState(null);
    const [dispatchEmailCount, setDispatchEmailCount] = useState(null);
    const [orderSource, setOrderSource]= useState(null);
    const [selectedProductData, setSelectedProductData] = useState(null);
    const [emailStatus, setEmailStatus] = useState(""); 

    const toggleEmailModal = useCallback(() => {
        setActiveEmailModal((prev) => !prev);
        console.log("toggleEmailModal clicked! New State:", !activeEmailModal);
    }, []);
    
    return {
        tabs,selectedTab,setSelectedTab,
       productsWithEUD,
    fetcher,
    reorderState,
    spinner,
    editingProduct,
    editWarningMessages,
    handleReorderChange,
    editReorderDay,
    saveReorderDay,
    resetReorderfield,
    confirmReset,
    toggleModal,
    activeModal,
    selectedProductId,
    selectedVariantId,
    onCancel,
    bannerWithEUD,
    loadingWithEUD: fetcher?.state !== "idle",
      };

};