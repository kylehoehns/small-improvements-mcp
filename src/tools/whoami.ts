import type { SiGetter } from "../siClient.js";

export interface WhoAmI {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  managerId: string | null;
}

export async function runWhoami(client: SiGetter): Promise<WhoAmI> {
  const me = await client.get<any>("/v2/users/me");
  return {
    id: me.id,
    name: me.name,
    email: me.email,
    role: me.role,
    department: me.department ?? null,
    managerId: me.managerId ?? null,
  };
}
