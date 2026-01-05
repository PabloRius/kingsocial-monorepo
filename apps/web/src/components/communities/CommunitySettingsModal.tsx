"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { deleteCommunityById } from "@/services/communities";
import { DialogTitle } from "@radix-ui/react-dialog";
import { CommunityDTO } from "@repo/shared-types";
import {
  Image as ImageIcon,
  Lock,
  Save,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  community: CommunityDTO;
}

export const CommunitySettingsModal = ({
  open,
  onOpenChange,
  community,
}: SettingsModalProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: community.name,
    description: community.description,
    mode: community.mode,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // await updateCommunity(community.id, formData);
      toast.success("Community settings updated");
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const result = await deleteCommunityById(community.id);
      if (result) {
        toast.success("Community deleted");
        router.push("/communities");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting community, see logs for more details.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-150 flex flex-col p-0 overflow-hidden rounded-3xl border-none">
        <div className="flex h-full w-full">
          {/* Internal Sidebar */}
          <Tabs defaultValue="general" className="flex w-full flex-row">
            <div className="w-1/3 bg-slate-50 border-r border-slate-100 p-6 flex flex-col gap-8">
              <div>
                <DialogTitle className="font-bold text-slate-900 text-lg">
                  Management
                </DialogTitle>
                <p className="text-xs text-slate-500">
                  Configure your community
                </p>
              </div>

              <TabsList className="flex flex-col bg-transparent h-auto gap-2 p-0">
                <TabsTrigger
                  value="general"
                  className="justify-start gap-2 px-4 py-3 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm w-full"
                >
                  <ImageIcon className="w-4 h-4" /> General
                </TabsTrigger>
                <TabsTrigger
                  value="privacy"
                  className="justify-start gap-2 px-4 py-3 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm w-full"
                >
                  <Lock className="w-4 h-4" /> Privacy
                </TabsTrigger>
                <TabsTrigger
                  value="danger"
                  className="justify-start gap-2 px-4 py-3 rounded-xl data-[state=active]:text-red-600 w-full text-slate-500"
                >
                  <ShieldAlert className="w-4 h-4" /> Danger Zone
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 p-8 pt-14 overflow-y-auto">
                <TabsContent value="general" className="mt-0 space-y-6">
                  <div className="space-y-2">
                    <Label>Community Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="rounded-xl border-slate-200 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      className="rounded-xl border-slate-200 resize-none"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="privacy" className="mt-0 space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="space-y-0.5">
                      <Label className="text-base">Private Mode</Label>
                      <p className="text-xs text-slate-500">
                        Require approval for new members
                      </p>
                    </div>
                    <Switch
                      checked={formData.mode === "private"}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          mode: checked ? "private" : "public",
                        })
                      }
                    />
                  </div>
                </TabsContent>

                <TabsContent value="danger" className="mt-0 space-y-6">
                  <div className="p-6 border-2 border-red-50 bg-red-50/30 rounded-3xl space-y-4">
                    <div className="flex items-center gap-3 text-red-600">
                      <ShieldAlert className="w-6 h-6" />
                      <h4 className="font-bold uppercase tracking-wider text-xs">
                        Critical Action
                      </h4>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Deleting this community will permanently erase all chat
                      history, events, and member data. This cannot be undone.
                    </p>
                    <Button
                      variant="destructive"
                      className="w-full rounded-xl font-bold py-6 shadow-lg shadow-red-200"
                      onClick={handleDelete}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete Community
                    </Button>
                  </div>
                </TabsContent>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white">
                <Button
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 rounded-xl px-8 shadow-lg shadow-blue-100"
                >
                  {loading ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
