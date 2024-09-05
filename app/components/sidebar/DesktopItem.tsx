// sidebar 개별 항목 (chat, user, search, logout)

import clsx from "clsx";
import Link from "next/link";
import { IconType } from "react-icons";

interface DesktopItemProps {
    href: string;
    label: string;
    icon: IconType;
    active?: boolean;
    onClick?: () => void;
  }

// props: DesktopSidebar
export default function DesktopItem({ 
    href, 
    label, 
    icon: Icon, 
    active, 
    onClick 
}: DesktopItemProps) {

    return (
        <li onClick={onClick}>
            <Link 
                href={href}
                className={
                    clsx(`group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold text-gray-500 hover:text-black hover:bg-gray-100`,
                    active && 'bg-gray-100 text-black' 
                )}
            >
                <Icon className="h-6 w-6 shrink-0" />
                <span className="sr-only">
                    {label}
                </span>
            </Link>
        </li>
    )
}