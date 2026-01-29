import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllRecentRepos, validateToken, fetchPrCount, fetchRecentActions, rerunWorkflow } from "../services/github";

export function useGithubRepos(token: string | null) {
  return useQuery({
    queryKey: ["repos", token],
    queryFn: () => fetchAllRecentRepos(token!),
    enabled: !!token, // Só roda se tiver token
    staleTime: 1000 * 60 * 5, // Cache por 5 minutos
    retry: false
  });
}

export function usePrCount(token: string | null, owner: string, name: string) {
  return useQuery({
    queryKey: ["pr-count", owner, name],
    queryFn: () => fetchPrCount(token!, owner, name),
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useRecentActions(token: string | null, owner: string, name: string, enabled: boolean) {
  return useQuery({
    queryKey: ["recent-actions", owner, name],
    queryFn: () => fetchRecentActions(token!, owner, name),
    enabled: !!token && enabled,
    staleTime: 1000 * 30, 
  });
}

export function useRerunWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, owner, name, runId }: { token: string; owner: string; name: string; runId: number }) => 
      rerunWorkflow(token, owner, name, runId),
    onSuccess: (_, { owner, name }) => {
      queryClient.invalidateQueries({ queryKey: ["recent-actions", owner, name] });
    },
  });
}

export function useValidateToken() {
  return useMutation({
    mutationFn: validateToken,
  });
}
