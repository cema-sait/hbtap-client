"use client";

import { useState, useEffect, ComponentType } from "react";
import { PublicProposal } from "@/types/new/public";
import { getPublicProposals } from "../api/public";

export interface WithProposalsInjectedProps {
  proposals: PublicProposal[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function withProposals<T extends WithProposalsInjectedProps>(
  WrappedComponent: ComponentType<T>
) {
  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";

  function WithProposalsWrapper(
    props: Omit<T, keyof WithProposalsInjectedProps>
  ) {
    const [proposals, setProposals] = useState<PublicProposal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tick, setTick] = useState(0);

    useEffect(() => {
      let cancelled = false;

      setIsLoading(true);
      setError(null);

      getPublicProposals()
        .then((results) => {
          if (!cancelled) setProposals(results);
        })
        .catch((err: unknown) => {
          if (!cancelled) {
            setProposals([]);
            setError(
              err instanceof Error ? err.message : "An unexpected error occurred"
            );
          }
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });

      return () => {
        cancelled = true;
      };
    }, [tick]);

    const refetch = () => setTick((t) => t + 1);

    const injected: WithProposalsInjectedProps = {
      proposals,
      isLoading,
      error,
      refetch,
    };

    return <WrappedComponent {...(props as T)} {...injected} />;
  }

  WithProposalsWrapper.displayName = `withProposals(${displayName})`;
  return WithProposalsWrapper;
}