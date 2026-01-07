"use client";

import { ItemCard } from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/context/ProfileContext";
import { useDebounce } from "@/hooks/useDebounce";
import {
  getMarketplaceStore,
  getRecommendedItems,
  toggleBookmark,
} from "@/services/marketplace";
import {
  CATEGORIES_FILTER,
  CategoryFilter,
  ConditionFilter,
  ProductDTO,
} from "@repo/shared-types";
import {
  Loader2,
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function MarketplacePage() {
  // Tabs
  const [activeTab, setActiveTab] = useState<string>("recommendations");

  // Profile state
  const { profile } = useProfile();
  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [category, setCategory] = useState<CategoryFilter>("All Categories");
  const [priceRange, setPriceRange] = useState<number[]>([0, 3000]);
  const [condition, setCondition] = useState<ConditionFilter>("Any");

  const resetQuery = () => {
    setSearchQuery("");
    setCategory("All Categories");
    setPriceRange([0, 3000]);
    setCondition("Any");
  };

  // Items & pagination
  const [items, setItems] = useState<ProductDTO[] | undefined | null>(
    undefined
  );
  const [recommendedItems, setRecommendedItems] = useState<
    ProductDTO[] | undefined | null
  >(undefined);
  const [page, setPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const limit = 12;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await getMarketplaceStore({
          search: debouncedSearchQuery,
          category,
          condition,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          page,
          limit,
        });
        setItems(response?.data?.products || null);
        setTotalCount(response?.data?.totalCount || 0);
      } catch (error) {
        console.error(error);
        setItems(null);
        setTotalCount(0);
      }
    };
    fetchItems();
  }, [debouncedSearchQuery, category, priceRange, condition, page, limit]);

  useEffect(() => {
    if (!profile) return;
    const fetchRecommendedItems = async () => {
      try {
        const result = await getRecommendedItems();
        console.log(result);
        setRecommendedItems(result.data || null);
      } catch (error) {
        console.error(error);
      }
    };
    fetchRecommendedItems();
  }, [profile]);

  // Bookmarking
  const bookmarkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [sessionToggles, setSessionToggles] = useState<Record<string, boolean>>(
    {}
  );
  const bookmarkedIds =
    items
      ?.filter((item) => {
        const isInitiallyBookmarked = profile?.bookmarkedProducts?.includes(
          item.id
        );
        const sessionOverride = sessionToggles[item.id];

        return sessionOverride ?? isInitiallyBookmarked;
      })
      .map((i) => i.id) || [];

  const bookmarkedItems = items
    ? items.filter((item) => bookmarkedIds.includes(item.id))
    : [];

  const handleBookmarkProduct = (itemId: string) => {
    const isCurrentlyBookmarked = bookmarkedIds.includes(itemId);
    const nextState = !isCurrentlyBookmarked;

    // 1. Instant UI Feedback
    setSessionToggles((prev) => ({ ...prev, [itemId]: nextState }));

    // 2. Debounced API Call
    if (bookmarkTimeoutRef.current) clearTimeout(bookmarkTimeoutRef.current);

    bookmarkTimeoutRef.current = setTimeout(async () => {
      try {
        await toggleBookmark(itemId);
      } catch (error) {
        // 3. Revert session state on error
        setSessionToggles((prev) => ({
          ...prev,
          [itemId]: isCurrentlyBookmarked,
        }));
        console.error("Failed to sync bookmark:", error);
      }
    }, 500);
  };

  // Helpers

  const isSeller = !!profile?.sellerProfile;

  const itemRelations: Record<string, ProductDTO[] | undefined | null> = {
    recommendations: recommendedItems,
    all: items,
    bookmarks: bookmarkedItems,
  };

  return (
    <main className="flex-1 p-6">
      {/* Hero Section */}
      <div className="mb-8 bg-linear-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Discover Amazing Items</h2>
            <p className="text-blue-100">
              Buy and sell with confidence in our trusted marketplace
            </p>
          </div>
          <div className="flex gap-3">
            {profile === undefined ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Link
                  href={
                    isSeller ? "/marketplace/sell" : "/marketplace/select-plan"
                  }
                >
                  <Button
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    {isSeller ? "Sell Something" : "Start Selling"}
                  </Button>
                </Link>
                {isSeller && (
                  <Link href="marketplace/your-listings">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white text-white hover:bg-white/10 font-semibold bg-transparent"
                    >
                      <Package className="mr-2 h-5 w-5" />
                      Your Listings
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        {activeTab !== "recommendations" && (
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder={
                activeTab === "recommendations"
                  ? "Filters are disabled in recommendations"
                  : "Search for products"
              }
              value={searchQuery}
              disabled={activeTab === "recommendations"}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 h-14 text-lg bg-white border-blue-200 focus:border-blue-400 shadow-sm rounded-xl"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => setSearchQuery("")}
              >
                <span className="sr-only">Clear search</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Filters Section */}
      <div className="mb-6 flex flex-1 flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Category Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full flex-1 sm:w-auto"
        >
          <div className="flex flex-1 flex-row justify-between">
            <TabsList
              className={`bg-white border border-blue-200 grid ${
                bookmarkedItems.length > 0 ? "grid-cols-3" : "grid-cols-2"
              } sm:inline-flex`}
            >
              <TabsTrigger
                value="recommendations"
                className="data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-800 data-[state=active]:text-white"
              >
                Recommendations
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-800 data-[state=active]:text-white"
              >
                All
              </TabsTrigger>
              {bookmarkedItems.length > 0 && (
                <TabsTrigger
                  value="bookmarks"
                  className="data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-800 data-[state=active]:text-white"
                >
                  Bookmarks
                </TabsTrigger>
              )}
            </TabsList>

            {/* Filter Drawer */}
            {activeTab !== "recommendations" && (
              <Drawer>
                <DrawerTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-blue-300 hover:bg-blue-50 w-full sm:w-auto bg-transparent"
                  >
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Filter Products</DrawerTitle>
                    <DrawerDescription>
                      {"Adjust filters to find exactly what you're looking for"}
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="p-4 space-y-6">
                    {/* Category Filter */}
                    <div>
                      <h3 className="font-semibold mb-3 text-gray-900">
                        Category
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {CATEGORIES_FILTER.map((_category) => (
                          <Button
                            key={_category}
                            variant={
                              _category === category ? "default" : "outline"
                            }
                            onClick={() => setCategory(_category)}
                            className={
                              _category === category
                                ? "bg-linear-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                                : "border-blue-200 hover:bg-blue-50"
                            }
                          >
                            {_category}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <h3 className="font-semibold mb-3 text-gray-900">
                        Price Range
                      </h3>
                      <div className="space-y-4">
                        <Slider
                          value={priceRange}
                          onValueChange={setPriceRange}
                          max={1000}
                          step={10}
                          className="w-full"
                        />
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>${priceRange[0]}</span>
                          <span>${priceRange[1]}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DrawerFooter>
                    <DrawerClose asChild>
                      <Button className="bg-linear-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900">
                        Apply Filters
                      </Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            )}
          </div>

          {Object.keys(itemRelations).map((tab) => (
            <TabsContent value={tab} key={tab}>
              {/* Search Results Info */}
              {searchQuery && activeTab !== "recommendations" && (
                <div className="mb-4 text-sm text-gray-600">
                  Found{" "}
                  <span className="font-semibold text-blue-600">
                    {itemRelations[tab] ? itemRelations[tab].length : 0}
                  </span>{" "}
                  results for &quot;
                  <span className="font-semibold">{searchQuery}</span>&quot;
                </div>
              )}

              {/* Products Grid */}
              {!!itemRelations[tab] && itemRelations[tab].length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {itemRelations[tab].map((item) => (
                    <ItemCard
                      key={item.id}
                      mode="marketplace"
                      item={item}
                      isLoggedIn={!!profile}
                      bookmarkedIds={bookmarkedIds}
                      onBookmark={handleBookmarkProduct}
                    />
                  ))}
                </div>
              ) : itemRelations[tab] === undefined ? (
                <div className="flex flex-1 w-full h-100 items-center justify-center">
                  <Loader2 className="animate-spin" />
                </div>
              ) : (
                <div className="flex-1 items-center text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                    {tab === "recommendations" ? (
                      <Sparkles className="h-8 w-8 text-blue-600" />
                    ) : (
                      <Search className="h-8 w-8 text-blue-600" />
                    )}
                  </div>

                  <h3 className="text-xl font-semibold mb-2">
                    {tab === "recommendations"
                      ? "No recommendations yet"
                      : "No products found"}
                  </h3>

                  <p className="text-gray-600 mb-4">
                    {tab === "recommendations"
                      ? "Try joining more communities or updating your profile interests so our AI can find the perfect items for you!"
                      : "Try adjusting your search or filters"}
                  </p>

                  {tab !== "recommendations" && (
                    <Button variant="outline" onClick={resetQuery}>
                      Clear all filters
                    </Button>
                  )}
                </div>
              )}

              {/* Pagination */}
              {itemRelations[tab] && itemRelations[tab].length > 0 && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full w-8 h-8"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                    >
                      &lt;
                    </Button>

                    {[...Array(Math.ceil(totalCount / limit)).keys()].map(
                      (_, i) => {
                        const pageNumber = i + 1;
                        return (
                          <Button
                            key={pageNumber}
                            variant="outline"
                            size="sm"
                            className={`rounded-full w-8 h-8 ${
                              page === pageNumber
                                ? "bg-celestial-blue-500 text-white border-celestial-blue-500"
                                : ""
                            }`}
                            onClick={() => setPage(pageNumber)}
                          >
                            {pageNumber}
                          </Button>
                        );
                      }
                    )}

                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full w-8 h-8"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= Math.ceil(totalCount / limit)}
                    >
                      &gt;
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </main>
  );
}
