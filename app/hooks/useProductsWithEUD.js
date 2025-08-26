import { useState, useEffect, useCallback,useLayoutEffect,useMemo } from "react";
import { useFetcher, useLoaderData ,useSearchParams} from "@remix-run/react";
import { useOutletContext } from '@remix-run/react';
import {groupVariantsByProduct} from '../utils/shopify';
import { useProducts } from "../componets/ProductContext";

export function useProductsWithEUD(fetcher) {
    const { plan,shopID,bufferTime,templateId,logo,coupon,discount } = useOutletContext();
    const {products, setProducts } = useProducts();
    const currentProducts = Array.isArray(products.productsWithMetafield) ? products.productsWithMetafield : [];
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

    const groupedProductsWithEUD = useMemo(() => {
  const filteredProducts = currentProducts.filter(
    (p) => p.reorder_days && p.reorder_days.value && Number(p.reorder_days.value) > 0
  );

  return groupVariantsByProduct(filteredProducts);
}, [currentProducts]);


    useEffect(() => {
    if (fetcher?.data?.success || fetcher?.data?.error) {
      setBannerWithEUD(fetcher.data);
      const timer = setTimeout(() => setBannerWithEUD(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [fetcher?.data]);

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
        fetcher.submit(formData, { method: "patch" });
        
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
    const [emailStatus, setEmailStatus] = useState({}); 

    const toggleEmailModal = useCallback(() => {
        setActiveEmailModal((prev) => !prev);
    }, []);

    const showEmailCount = async (product,product_id,variant_id) => {
        try {
            setSelectedProductData(product);
            setSelectedProductId(product_id);
            setSelectedVariantId(variant_id);
            setIsFetchingEmailCount(true);
            setEmailStatus(prev => {
              const copy = { ...prev };
              delete copy[variant_id];
              return copy;
            });
            fetcher.submit(
                {
                    shopId: shopID,
                    productId: product_id,
                    variantId: variant_id,
                    type:"fetchEmailCount",
                },
                { method: "post" }
            );
            
        } catch (error) {
            setIsFetchingEmailCount(false);
            console.error("Error fetching email count:", error);
            
            
            
        }
    };

    const testEmailReminder=async(product_id,variant_id)=>{
        fetcher.submit(
                {
                    shopId: shopID,
                    productId: product_id,
                    variantId: variant_id,
                    type:"test_email",
                },
                { method: "post" }
            );
        
    }

    useEffect(() => {
            if (isFetchingEmailCount) return;
            if (fetcher.state === "submitting" || fetcher.state === "loading") {
                setSpinner(true); // Start loading spinner
            } else {
                setSpinner(false); // Stop spinner when data is ready
            }
        }, [fetcher.state, isFetchingEmailCount]);

     useLayoutEffect(() => {
        if (fetcher.data?.type === "fetchEmailCount") {    
            setScheduleEmailCount(fetcher.data.Scheduled_Count);
            setDispatchEmailCount(fetcher.data.Dispatched_Count);
            setOrderSource(fetcher.data.Reorder_Email_Source);
            toggleEmailModal();
        }
        // if (fetcher.data?.type === "testEmailSent") {    
        //     setEmailStatus(prev => ({
        //     ...prev,
        //     [selectedVariantId]: fetcher.data.message
        //     }));
        // }
    }, [fetcher?.data]);
    
    return {plan,bufferTime,
        tabs,selectedTab,setSelectedTab,
       productsWithEUD: groupedProductsWithEUD,
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
    loadingWithEUD: fetcher?.state !== "idle",selectedProductData,
    activeEmailModal,toggleEmailModal,showEmailCount,testEmailReminder,scheduleEmailCount,dispatchEmailCount,orderSource,emailStatus
      };

};