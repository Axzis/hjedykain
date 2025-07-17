
import { MembersDataTable } from "@/components/admin/members-data-table";
import { db } from "@/lib/firebase";
import { Member } from "@/lib/types";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

const PAGE_SIZE = 10;

async function getMembers(page: number = 1, search: string = ''): Promise<{members: Member[], total: number}> {
  const membersCol = collection(db, "members");
  
  // Base query to get all members for filtering
  const allMembersQuery = query(membersCol, orderBy("name"));
  const memberSnapshot = await getDocs(allMembersQuery);
  let memberList = memberSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member));

  // Perform case-insensitive search in code
  if (search) {
      const searchLower = search.toLowerCase();
      memberList = memberList.filter(member => member.name.toLowerCase().includes(searchLower));
  }
  
  const total = memberList.length;

  // Paginate the filtered results
  const paginatedMembers = memberList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return { members: paginatedMembers, total };
}

export default async function AdminMembersPage({ searchParams }: { searchParams: { page?: string, search?: string } }) {
    const page = Number(searchParams.page) || 1;
    const search = searchParams.search || '';
    const { members, total } = await getMembers(page, search);
  
    return (
      <div className="container mx-auto py-2">
        <MembersDataTable data={members} page={page} total={total} pageSize={PAGE_SIZE} />
      </div>
    )
  }
