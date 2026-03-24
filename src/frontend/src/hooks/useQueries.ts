import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  BookingStatus,
  InventoryItem,
  SalonService,
  StylistProfile,
} from "../backend";
import { useActor } from "./useActor";

export function useDailyEarnings() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["dailyEarnings"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getDailyEarnings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useEarningsByCategory() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[string, bigint]>>({
    queryKey: ["earningsByCategory"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getEarningsByCategory();
      return result as Array<[string, bigint]>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLowStockItems() {
  const { actor, isFetching } = useActor();
  return useQuery<InventoryItem[]>({
    queryKey: ["lowStockItems"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLowStockItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useInventoryItems() {
  const { actor, isFetching } = useActor();
  return useQuery<InventoryItem[]>({
    queryKey: ["inventoryItems"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getInventoryItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllBookings() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allBookings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useServices() {
  const { actor, isFetching } = useActor();
  return useQuery<SalonService[]>({
    queryKey: ["services"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getServices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStylists() {
  const { actor, isFetching } = useActor();
  return useQuery<StylistProfile[]>({
    queryKey: ["stylists"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStylists();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateBookingStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      bookingId,
      status,
    }: { bookingId: string; status: BookingStatus }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateBookingStatus(bookingId, status);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allBookings"] }),
  });
}

export function useAddInventoryItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: InventoryItem) => {
      if (!actor) throw new Error("No actor");
      return actor.addInventoryItem(item);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventoryItems"] }),
  });
}

export function useUpdateInventoryItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: InventoryItem) => {
      if (!actor) throw new Error("No actor");
      return actor.updateInventoryItem(item);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventoryItems"] }),
  });
}

export function useDeleteInventoryItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteInventoryItem(itemId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventoryItems"] }),
  });
}

export function useAddService() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (service: SalonService) => {
      if (!actor) throw new Error("No actor");
      return actor.addService(service);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}

export function useAddStylist() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (stylist: StylistProfile) => {
      if (!actor) throw new Error("No actor");
      return actor.addStylist(stylist);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stylists"] }),
  });
}
