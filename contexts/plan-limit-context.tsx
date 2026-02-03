"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { PlanLimitModal, PlanLimitType } from "@/app/_components/ui/plan-limit-modal";
import { PricingModal } from "@/app/_components/ui/pricing-modal";

interface PlanLimitContextType {
  openPlanLimitModal: (limitType?: PlanLimitType) => void;
  openPricingModal: () => void;
  closePricingModal: () => void;
}

const PlanLimitContext = createContext<PlanLimitContextType | undefined>(
  undefined,
);

export function PlanLimitProvider({ children }: { children: React.ReactNode }) {
  const [planLimitOpen, setPlanLimitOpen] = useState(false);
  const [planLimitType, setPlanLimitType] = useState<PlanLimitType>("transactions");
  const [pricingOpen, setPricingOpen] = useState(false);

  const openPlanLimitModal = useCallback((limitType: PlanLimitType = "transactions") => {
    setPlanLimitType(limitType);
    setPlanLimitOpen(true);
  }, []);

  const openPricingModal = useCallback(() => {
    setPricingOpen(true);
  }, []);

  const closePricingModal = useCallback(() => {
    setPricingOpen(false);
  }, []);

  return (
    <PlanLimitContext.Provider
      value={{
        openPlanLimitModal,
        openPricingModal,
        closePricingModal,
      }}
    >
      {children}
      <PlanLimitModal
        open={planLimitOpen}
        onClose={() => setPlanLimitOpen(false)}
        limitType={planLimitType}
        onUpgrade={() => {
          setPlanLimitOpen(false);
          setPricingOpen(true);
        }}
      />
      <PricingModal open={pricingOpen} onClose={closePricingModal} />
    </PlanLimitContext.Provider>
  );
}

export function usePlanLimit() {
  const context = useContext(PlanLimitContext);
  if (context === undefined) {
    throw new Error("usePlanLimit deve ser usado dentro de PlanLimitProvider");
  }
  return context;
}
