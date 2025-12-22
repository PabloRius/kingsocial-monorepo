import { ApiResponse, UserDTO } from "@repo/shared-types";

async function getUsers(): Promise<UserDTO[]> {
  const res = await fetch("http://localhost:4000/users", {
    cache: "no-store",
  });

  const json: ApiResponse<UserDTO[]> = await res.json();
  return json.data;
}

export default async function HomePage() {
  const users = await getUsers();

  return (
    <main>
      <h1>Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.email}</li>
        ))}
      </ul>
    </main>
  );
}
