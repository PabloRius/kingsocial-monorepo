"use client";

import { ItemCard } from "@/components/ItemCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  deleteItemById,
  getOwnMarketplaceStore,
  markItemAsSold,
} from "@/services/marketplace";
import { ProductDTO } from "@repo/shared-types";
import {
  CheckCircle,
  Loader2,
  Package,
  Plus,
  PoundSterling,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function YourItemsPage() {
  const [items, setItems] = useState<ProductDTO[] | undefined | null>(
    undefined
  );
  const { status } = useSession();
  const fetchItems = useCallback(async () => {
    if (status !== "authenticated") return;
    try {
      const result = await getOwnMarketplaceStore();
      setItems(result.data);
    } catch (error) {
      console.error(error);
      setItems(null);
    }
  }, [status]);

  useEffect(() => {
    const initFetchItems = async () => {
      await fetchItems();
    };
    initFetchItems();
  }, [fetchItems]);

  const [itemToDelete, setItemToDelete] = useState<ProductDTO | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (items === null) {
    redirect("/");
  }

  const activeItems = items
    ? items.filter((i) => i.status === "active")
    : undefined;
  const soldItems = items
    ? items.filter((i) => i.status === "sold")
    : undefined;

  const totalStats =
    items && activeItems && soldItems
      ? {
          active: activeItems.length,
          sold: soldItems.length,
          totalViews: items.reduce((sum, l) => sum + l.views, 0),
          totalBookmarks: items.reduce((sum, l) => sum + l.bookmarks, 0),
          totalEarnings: soldItems.reduce((sum, l) => sum + l.price, 0),
        }
      : undefined;

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    await deleteItemById(itemToDelete.id);

    fetchItems();

    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleDelete = (item: ProductDTO) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleMarkSold = async (itemId: string) => {
    try {
      const response = await markItemAsSold(itemId);

      if (response) toast.success("Congrats on the transaction!");
    } catch (error) {
      console.error(error);
    }

    toast.error("Error updating item");
  };

  const handleResell = async () => {};

  return (
    <main className="flex flex-col flex-1 py-6 px-4 sm:px-6">
      {/* Stats Overview */}
      <div className="mb-8">
        <div className="bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold">Your Items</h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                {totalStats ? (
                  <div className="text-3xl font-bold">{totalStats.active}</div>
                ) : (
                  <Loader2 className="animate-spin" />
                )}
                <div className="text-sm text-white/90">
                  Active Item{totalStats ? totalStats.active > 1 && "s" : ""}
                </div>
              </div>
              <div className="h-12 w-px bg-white/30"></div>
              <div className="text-center">
                {totalStats ? (
                  <div className="text-3xl font-bold">{totalStats.sold}</div>
                ) : (
                  <Loader2 className="animate-spin" />
                )}
                <div className="text-sm text-white/90">
                  Sold Item{totalStats ? totalStats.sold > 1 && "s" : ""}
                </div>
              </div>
              <div className="h-12 w-px bg-white/30"></div>
              <div className="text-center">
                <div className="text-3xl font-bold flex items-center justify-center gap-1">
                  <PoundSterling className="h-7 w-7" />
                  {totalStats ? (
                    totalStats.totalEarnings.toFixed(2)
                  ) : (
                    <Loader2 className="animate-spin" />
                  )}
                </div>
                <div className="text-sm text-white/90">Total Earned</div>
              </div>
              <div className="h-12 w-px bg-white/30"></div>
              <Button
                asChild
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl font-semibold"
              >
                <Link href="sell">
                  <Plus className="mr-2 h-5 w-5" />
                  Create New Item
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Items Tabs */}
      {items && activeItems && soldItems ? (
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="bg-white border border-gray-200 shadow-sm">
            <TabsTrigger
              value="active"
              className="data-[state=active]:bg-linear-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Active ({activeItems.length})
            </TabsTrigger>
            <TabsTrigger
              value="sold"
              className="data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
            >
              <PoundSterling className="h-4 w-4 mr-2" />
              Sold ({soldItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {activeItems.length > 0 ? (
              <div
                className={`grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`}
              >
                {activeItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    mode="dashboard"
                    item={item}
                    onDelete={handleDelete}
                    onMarkSold={handleMarkSold}
                    onReSell={handleResell}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center border-dashed border-2 border-gray-300">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-br from-green-400 to-emerald-500 mb-4">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Active Items</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {
                    "You don't have any active items yet. Create your first item to start selling!"
                  }
                </p>
                <Button
                  asChild
                  size="lg"
                  className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Link href="sell">
                    <Plus className="mr-2 h-5 w-5" />
                    Create Your First Item
                  </Link>
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sold" className="space-y-6">
            {soldItems.length > 0 ? (
              <div
                className={`grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`}
              >
                {soldItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    mode="dashboard"
                    item={item}
                    onDelete={handleDelete}
                    onReSell={handleResell}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center border-dashed border-2 border-gray-300">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-br from-blue-400 to-blue-600 mb-4">
                  <PoundSterling className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Sold Items Yet</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {
                    "You haven't sold any items yet. Keep promoting your active items!"
                  }
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="w-full h-full flex flex-1 items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{itemToDelete?.name}
              &quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
