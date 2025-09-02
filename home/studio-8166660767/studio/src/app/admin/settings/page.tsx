
import { UnitsDataTable } from "@/components/admin/settings/units-data-table";
import { db } from "@/lib/firebase";
import { Unit } from "@/lib/types";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

async function getUnits(): Promise<Unit[]> {
  const unitsCol = collection(db, "units");
  const unitsQuery = query(unitsCol, orderBy("createdAt", "desc"));
  const unitSnapshot = await getDocs(unitsQuery);
  return unitSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Unit));
}

export default async function SettingsPage() {
    const units = await getUnits();
  
    return (
      <div className="container mx-auto py-2">
        <div className="flex flex-col gap-4 mb-2">
            <h2 className="text-3xl font-bold tracking-tight font-headline">Master Settings</h2>
            <p className="text-muted-foreground">Manage master data for your application.</p>
        </div>
        <UnitsDataTable data={units} />
      </div>
    )
  }
