
import { UsersDataTable } from "@/components/admin/users-data-table";
import { db } from "@/lib/firebase";
import { User } from "@/lib/types";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

async function getUsers(page: number = 1, search: string = '', pageSize: number = 10): Promise<{users: User[], total: number}> {
  const usersCol = collection(db, "users");
  
  const allUsersQuery = query(usersCol, orderBy("name"));
  const userSnapshot = await getDocs(allUsersQuery);
  let userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));

  if (search) {
      const searchLower = search.toLowerCase();
      userList = userList.filter(user => user.name.toLowerCase().includes(searchLower));
  }
  
  const total = userList.length;

  const paginatedUsers = userList.slice((page - 1) * pageSize, page * pageSize);

  return { users: paginatedUsers, total };
}

export default async function AdminUsersPage({ searchParams }: { searchParams: { page?: string, search?: string, pageSize?: string } }) {
    const page = Number(searchParams.page) || 1;
    const pageSize = Number(searchParams.pageSize) || 10;
    const search = searchParams.search || '';
    const { users, total } = await getUsers(page, search, pageSize);
  
    return (
      <div className="container mx-auto py-2">
        <UsersDataTable data={users} page={page} total={total} pageSize={pageSize} />
      </div>
    )
  }
