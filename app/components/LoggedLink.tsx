"use client";
import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useLogging } from "../hooks/useLogging";

interface LoggedLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  logMetadata?: Record<string, any>;
}

const LoggedLink: React.FC<LoggedLinkProps> = ({ 
  href, 
  children, 
  className = "", 
  onClick,
  logMetadata = {} 
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const loggingService = useLogging();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Log navigation
    await loggingService.logNavigation(pathname, href, {
      linkType: "header_navigation",
      ...logMetadata
    });
    
    // Execute custom onClick if provided
    if (onClick) {
      onClick();
    }
    
    // Navigate to destination
    router.push(href);
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
};

export default LoggedLink;
