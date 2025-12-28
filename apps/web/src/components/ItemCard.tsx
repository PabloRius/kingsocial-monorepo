import { formatDate } from "@/lib/formatters";
import { ProductDTO, ProfileDTO } from "@repo/shared-types";
import {
  Bookmark,
  Calendar,
  CheckCircle,
  Edit,
  Eye,
  MapPin,
  MoreVertical,
  RotateCcw,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface ItemCardProps {
  item: ProductDTO;
  mode: "marketplace" | "dashboard";
  profile?: ProfileDTO | null;
  bookmarkedIds?: string[];
  onBookmark?: (id: string) => void;
  onDelete?: (item: ProductDTO) => void;
  onMarkSold?: (id: string) => void;
  onReSell?: (id: string) => void;
}

export const ItemCard = ({
  item,
  mode,
  profile,
  bookmarkedIds = [],
  onBookmark,
  onDelete,
  onMarkSold,
  onReSell,
}: ItemCardProps) => {
  const isDashboard = mode === "dashboard";
  const isMarketplace = mode === "marketplace";

  return (
    <Link href={`/marketplace/${item.id}`}>
      <Card className="group overflow-hidden border-blue-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 h-full flex flex-col">
        <CardContent className="p-0 flex flex-col h-full">
          {/* IMAGE SECTION */}
          <div className="relative aspect-square overflow-hidden bg-linear-to-br from-blue-50 to-blue-100">
            <Image
              src={item.photos[0] || "/Placeholder-product.jpg"}
              alt={item.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* OVERLAYS BASED ON MODE */}
            {isMarketplace && !!profile && (
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 bg-white/90 hover:bg-white shadow-md z-10"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onBookmark?.(item.id);
                }}
              >
                <Bookmark
                  className={`h-4 w-4 text-blue-600 ${
                    bookmarkedIds.includes(item.id) ? "fill-blue-600" : ""
                  }`}
                />
              </Button>
            )}

            {isDashboard && (
              <>
                {/* Stats Overlay for Sellers */}
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md rounded-lg p-2 shadow-lg flex gap-3 z-10">
                  <div className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                    <Eye className="h-3.5 w-3.5 text-blue-500" /> {item.views}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                    <Bookmark className="h-3.5 w-3.5 text-red-500 fill-red-500" />{" "}
                    {item.bookmarks}
                  </div>
                </div>

                {/* Management Dropdown */}
                <div
                  className="absolute top-2 right-2 z-10"
                  onClick={(e) => e.preventDefault()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 bg-white/90 shadow-md"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          (window.location.href = `edit-item/${item.id}`)
                        }
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onMarkSold?.(item.id)}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Mark as Sold
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onReSell?.(item.id)}>
                        <RotateCcw className="mr-2 h-4 w-4" /> Re-Sell
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onDelete?.(item)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
          </div>

          {/* CONTENT SECTION */}
          <div className="p-4 flex flex-col flex-1">
            <div className="flex justify-between items-start mb-2 gap-2">
              <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                {item.name}
              </h3>
              <div className="text-xl font-bold text-blue-600 whitespace-nowrap">
                £{item.price}
              </div>
            </div>

            {isDashboard && (
              <p className="text-gray-500 text-sm line-clamp-2 mb-3 h-10">
                {item.description}
              </p>
            )}

            <div className="mt-auto space-y-2">
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate">{item.pickupLocation}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(item.createdAt)}</span>
                </div>
                {item.status === "sold" && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] uppercase tracking-wider"
                  >
                    Sold
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
