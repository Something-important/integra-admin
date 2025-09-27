"use client";

import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import type { NextPage } from "next";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ExclamationTriangleIcon, LockClosedIcon, HomeIcon, WalletIcon } from "@heroicons/react/24/outline";

const AccessDenied: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  const getMessageContent = () => {
    if (reason === 'no-wallet') {
      return {
        title: "Wallet Required",
        message: "Please connect your wallet to access this application.",
        details: "This admin panel requires a connected wallet for authentication and authorization.",
        icon: WalletIcon,
      };
    }

    return {
      title: "Access Denied",
      message: "Your wallet address is not authorized to access this application.",
      details: "Please contact an administrator to request access or switch to an authorized wallet.",
      icon: LockClosedIcon,
    };
  };

  const { title, message, details, icon: IconComponent } = getMessageContent();

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-6">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-error/10 mb-6">
            <IconComponent className="h-12 w-12 text-error" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-base-content mb-4">
            {title}
          </h1>

          {/* Message */}
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-medium text-base-content mb-2">
                  {message}
                </p>
                <p className="text-sm text-base-content/70">
                  {details}
                </p>
              </div>
            </div>
          </div>

          {/* Connected Address */}
          {connectedAddress ? (
            <div className="bg-base-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-base-content/60 mb-2">Connected Address:</p>
              <Address address={connectedAddress} />
            </div>
          ) : reason === 'no-wallet' ? (
            <div className="bg-base-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-base-content/60">
                No wallet connected. Please connect your wallet to proceed.
              </p>
            </div>
          ) : null}

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/"
              className="btn btn-primary w-full"
            >
              <HomeIcon className="h-5 w-5" />
              Return to Home
            </Link>

            <button
              onClick={() => window.location.reload()}
              className="btn btn-outline w-full"
            >
              Try Again
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-xs text-base-content/50">
              If you believe this is an error, please contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;