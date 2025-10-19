// components/PricingCalculator.jsx

import React, { useState, useEffect } from 'react';
import usePricing from '../hooks/usePricing';

const PricingCalculator = ({ buildingId = null, onPriceCalculated = null }) => {
  const { pricing, loading, error, calculatePrice, createInvoice, formatPrice, reset } = usePricing();
  
  const [selectedPackage, setSelectedPackage] = useState('basic');
  const [selectedPeriod, setSelectedPeriod] = useState('yearly');
  const [discount, setDiscount] = useState(0);
  const [isCreating, setIsCreating] = useState(false);

  const packages = [
    { slug: 'basic', name: 'Basic', rate: '99,000' },
    { slug: 'standard', name: 'Standard', rate: '120,000' },
    { slug: 'pro', name: 'Pro', rate: '180,000' },
    { slug: 'accounting-advanced', name: 'Accounting Advanced', rate: '69,000' },
  ];

  const periods = [
    { value: 'monthly', label: 'ماهانه', multiplier: 1 },
    { value: 'quarterly', label: 'سه‌ماهه', multiplier: 2.5 },
    { value: 'yearly', label: 'سالانه', multiplier: 10 },
  ];

  useEffect(() => {
    handleCalculate();
  }, [selectedPackage, selectedPeriod]);

  const handleCalculate = async () => {
    await calculatePrice(selectedPackage, selectedPeriod, buildingId);
  };

  const handleCreateInvoice = async () => {
    setIsCreating(true);
    const result = await createInvoice(selectedPackage, selectedPeriod, buildingId, discount);
    setIsCreating(false);
    
    if (result && onPriceCalculated) {
      onPriceCalculated(result);
    }
  };

  return (
    <div className="pricing-calculator">
      <div className="pricing-form">
        <h2>محاسبهٔ قیمت</h2>

        {error && (
          <div className="alert alert-error">
            {error}
            <button onClick={reset}>بستن</button>
          </div>
        )}

        <div className="form-group">
          <label>بسته</label>
          <select 
            value={selectedPackage}
            onChange={(e) => setSelectedPackage(e.target.value)}
            disabled={loading}
          >
            {packages.map((pkg) => (
              <option key={pkg.slug} value={pkg.slug}>
                {pkg.name} - {pkg.rate} ریال/واحد/ماه
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>دوره</label>
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            disabled={loading}
          >
            {periods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>تخفیف (ریال)</label>
          <input 
            type="number"
            value={discount}
            onChange={(e) => setDiscount(parseInt(e.target.value) || 0)}
            min="0"
            disabled={loading}
          />
        </div>

        {loading && (
          <div className="loading">
            در حال محاسبه...
          </div>
        )}

        {pricing && !loading && (
          <div className="pricing-result">
            <div className="result-row">
              <span>مبلغ کل:</span>
              <strong>{formatPrice(pricing.subtotal)}</strong>
            </div>

            {discount > 0 && (
              <div className="result-row">
                <span>تخفیف:</span>
                <strong>-{formatPrice(discount)}</strong>
              </div>
            )}

            <div className="result-row">
              <span>مالیات ({pricing.tax_percent}%):</span>
              <strong>+{formatPrice(pricing.tax)}</strong>
            </div>

            <div className="result-row total">
              <span>قیمت نهایی:</span>
              <strong>{formatPrice(pricing.total)}</strong>
            </div>

            <div className="pricing-items">
              <h4>اقلام</h4>
              {pricing.items && pricing.items.map((item, idx) => (
                <div key={idx} className="item">
                  <span>{item.title}</span>
                  <span>{formatPrice(item.line_total)}</span>
                </div>
              ))}
            </div>

            <button 
              className="btn btn-primary"
              onClick={handleCreateInvoice}
              disabled={isCreating}
            >
              {isCreating ? 'درحال ایجاد...' : 'ایجاد فاکتور'}
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .pricing-calculator {
          padding: 20px;
          background: #f9f9f9;
          border-radius: 8px;
        }

        h2 {
          margin-bottom: 20px;
          font-size: 24px;
          color: #333;
        }

        .alert {
          padding: 12px;
          margin-bottom: 20px;
          border-radius: 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .alert-error {
          background: #fee;
          color: #c33;
          border: 1px solid #fcc;
        }

        .form-group {
          margin-bottom: 16px;
        }

        label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #555;
        }

        input, select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          font-family: inherit;
        }

        input:disabled, select:disabled {
          background: #f0f0f0;
          cursor: not-allowed;
        }

        .loading {
          text-align: center;
          padding: 20px;
          color: #0066cc;
          font-weight: 500;
        }

        .pricing-result {
          margin-top: 20px;
          background: white;
          padding: 20px;
          border-radius: 4px;
          border: 1px solid #eee;
        }

        .result-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
          font-size: 16px;
        }

        .result-row.total {
          border-bottom: none;
          border-top: 2px solid #0066cc;
          font-size: 18px;
          font-weight: bold;
          color: #0066cc;
          padding: 15px 0;
          margin-top: 10px;
        }

        .pricing-items {
          margin: 20px 0;
          padding: 15px;
          background: #f9f9f9;
          border-radius: 4px;
        }

        .pricing-items h4 {
          margin-bottom: 10px;
          color: #555;
        }

        .item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
          color: #666;
        }

        .btn {
          width: 100%;
          padding: 12px;
          margin-top: 15px;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background: #0066cc;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #0052a3;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default PricingCalculator;
