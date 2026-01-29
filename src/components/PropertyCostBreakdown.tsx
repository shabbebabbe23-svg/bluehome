import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface PropertyCostBreakdownProps {
  price: number;
  fee: number;
  area: number;
  type: string;
  operatingCost: number;
  brfDebtPerSqm?: number;
}

const PropertyCostBreakdown = ({ price, fee, area, type, operatingCost, brfDebtPerSqm }: PropertyCostBreakdownProps) => {
  const [interestRate, setInterestRate] = useState(3);
  const [amortizationRate, setAmortizationRate] = useState(2);

  // Calculate costs
  const downPaymentPercent = 15; // 15% minimum down payment
  const downPayment = Math.round(price * (downPaymentPercent / 100));
  const loanAmount = price - downPayment;

  // Interest rate calculation
  const monthlyInterest = Math.round((loanAmount * (interestRate / 100)) / 12);

  // Amortization calculation
  const monthlyAmortization = Math.round((loanAmount * (amortizationRate / 100)) / 12);

  // Monthly fee
  const monthlyFee = fee;

  // Monthly operating cost
  const monthlyOperatingCost = operatingCost;

  // Total monthly cost
  const totalMonthlyCost = monthlyInterest + monthlyAmortization + monthlyFee + monthlyOperatingCost;

  // Electricity consumption estimate (100 kWh per 10m² per year)
  const annualElectricityConsumption = Math.round((area / 10) * 100);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4">Kostnadsberäkning</h2>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Utgångspris</span>
            <span className="font-semibold">{formatCurrency(price)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Minsta kontantinsats ({downPaymentPercent}%)</span>
            <span className="font-semibold">{formatCurrency(downPayment)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Bolån</span>
            <span className="font-semibold">{formatCurrency(loanAmount)}</span>
          </div>



          <h3 className="font-semibold text-base mb-3">Månadskostnad</h3>

          <div className="flex justify-between items-center h-10">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Ränta</span>
              <div className="relative w-20">
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 0) {
                      setInterestRate(val);
                    } else if (e.target.value === "") {
                      setInterestRate(0);
                    }
                  }}
                  className="pr-6 h-7 text-right text-xs"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
              </div>
            </div>
            <span className="font-medium">{formatCurrency(monthlyInterest)}</span>
          </div>

          <div className="flex justify-between items-center h-10">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Amortering</span>
              <div className="relative w-20">
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={amortizationRate}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 0) {
                      setAmortizationRate(val);
                    } else if (e.target.value === "") {
                      setAmortizationRate(0);
                    }
                  }}
                  className="pr-6 h-7 text-right text-xs"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
              </div>
            </div>
            <span className="font-medium">{formatCurrency(monthlyAmortization)}</span>
          </div>

          {monthlyFee > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Avgift</span>
              <span className="font-medium">{formatCurrency(monthlyFee)}</span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Driftkostnad</span>
            <span className="font-medium">{formatCurrency(monthlyOperatingCost)}</span>
          </div>

          {brfDebtPerSqm && brfDebtPerSqm > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">BRF skuld/m²</span>
              <span className="font-medium">{formatCurrency(brfDebtPerSqm)}</span>
            </div>
          )}

          <Separator className="my-4" />

          <div className="flex justify-between items-center text-lg">
            <span className="font-bold">Total månadskostnad</span>
            <span className="font-bold text-primary">{formatCurrency(totalMonthlyCost)}</span>
          </div>

          <Separator className="my-4" />

          <div>
            <h3 className="font-semibold text-base mb-3">Uppskattad elförbrukning</h3>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Ungefärlig förbrukning ({type}, {area}m²)*</span>
              <span className="font-medium">{annualElectricityConsumption.toLocaleString('sv-SE')} kWh/år</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              * Beräkningen är en uppskattning baserad på bostadens storlek
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCostBreakdown;
