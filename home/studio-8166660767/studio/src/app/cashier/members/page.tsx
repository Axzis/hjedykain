
import { MembersDataTable } from "@/components/admin/members-data-table";
import { db } from "@/lib/firebase";
import { Member } from "@/lib/types";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

async function getMembers(page: number = 1, search: string = '', pageSize: number = 10): Promise<{members: Member[], total: number}> {
  const membersCol = collection(db, "members");
  
  const allMembersQuery = query(membersCol, orderBy("name"));
  const memberSnapshot = await getDocs(allMembersQuery);
  let memberList = memberSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member));

  if (search) {
      const searchLower = search.toLowerCase();
      memberList = memberList.filter(member => member.name.toLowerCase().includes(searchLower));
  }
  
  const total = memberList.length;

  const paginatedMembers = memberList.slice((page - 1) * pageSize, page * pageSize);

  return { members: paginatedMembers, total };
}

export default async function CashierMembersPage({ searchParams }: { searchParams: { page?: string, search?: string, pageSize?: string } }) {
    const page = Number(searchParams.page) || 1;
    const pageSize = Number(searchParams.pageSize) || 10;
    const search = searchParams.search || '';
    const { members, total } = await getMembers(page, search, pageSize);
  
    return (
      <div className="container mx-auto py-2">
        <MembersDataTable data={members} page={page} total={total} pageSize={pageSize} />
      </div>
    )
  }
