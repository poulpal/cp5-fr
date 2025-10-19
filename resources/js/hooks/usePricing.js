// hooks/usePricing.js

import { useState, useCallback } from 'react';
import axios from 'axios';

const usePricing = () => {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculatePrice = useCallback(async (packageSlug, period, buildingId = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/v1/building_manager/proforma/preview`,
        {
          package_slug: packageSlug,
          period: period,
          building_id: buildingId,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setPricing(response.data.data);
        return response.data.data;
      } else {
        setError(response.data.message || 'خطا در محاسبهٔ قیمت');
        return null;
      }
    } catch (err) {
      const message = err.response?.data?.message || 'خطا در ارتباط با سرور';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createInvoice = useCallback(async (packageSlug, period, buildingId = null, discount = 0) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/v1/building_manager/proforma`,
        {
          package_slug: packageSlug,
          period: period,
          building_id: buildingId,
          discount: discount,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setPricing(response.data.data);
        return response.data.data;
      } else {
        setError(response.data.message || 'خطا در ایجاد فاکتور');
        return null;
      }
    } catch (err) {
      const message = err.response?.data?.message || 'خطا در ارتباط با سرور';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('fa-IR', {
      style: 'currency',
      currency: 'IRR',
      maximumFractionDigits: 0,
    }).format(price);
  }, []);

  const reset = useCallback(() => {
    setPricing(null);
    setError(null);
  }, []);

  return {
    pricing,
    loading,
    error,
    calculatePrice,
    createInvoice,
    formatPrice,
    reset,
  };
};

export default usePricing;
