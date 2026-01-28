import { GithubOrg, GithubRepo } from "../types/github";

const BASE_URL = "https://api.github.com";

export async function validateToken(token: string): Promise<boolean> {
  const response = await fetch(`${BASE_URL}/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.ok;
}

export async function fetchUserOrgs(token: string): Promise<GithubOrg[]> {
  const response = await fetch(`${BASE_URL}/user/orgs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch orgs");
  return response.json();
}

export async function fetchPersonalRepos(token: string): Promise<GithubRepo[]> {
  const response = await fetch(
    `${BASE_URL}/user/repos?sort=updated&direction=desc&per_page=30&type=owner`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!response.ok) return [];
  return response.json();
}

export async function fetchOrgRepos(token: string, orgName: string): Promise<GithubRepo[]> {
  // Aumentei per_page para 20 para trazer mais repositórios
  const response = await fetch(
    `${BASE_URL}/orgs/${orgName}/repos?sort=updated&direction=desc&per_page=20`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!response.ok) return [];
  return response.json();
}

export async function fetchAllRecentRepos(token: string): Promise<GithubRepo[]> {
  const orgs = await fetchUserOrgs(token);
  
  // Busca repositórios pessoais e das orgs em paralelo
  const repoPromises = [
    fetchPersonalRepos(token),
    ...orgs.map((org) => fetchOrgRepos(token, org.login))
  ];
  
  const results = await Promise.all(repoPromises);
  
  // Junta tudo
  const allRepos = results.flat();

  // Remove duplicatas (por segurança) usando um Map com o ID do repo
  const uniqueRepos = Array.from(new Map(allRepos.map(repo => [repo.id, repo])).values());

  // Ordena por updatedAt (o mais recente primeiro)
  return uniqueRepos.sort((a, b) => {
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}
