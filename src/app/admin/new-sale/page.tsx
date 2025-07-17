import SalesTerminal from "@/components/cashier/sales-terminal";
import { db } from "@/lib/firebase";
import { Product, Member } from "@/lib/types";
import { collection, getDocs } from "firebase/firestore";

async function getTerminalData() {
    const productsCol = collection(db, "products");
    const productSnapshot = await getDocs(productsCol);
    const products = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    
    const membersCol = collection(db, "members");
    const memberSnapshot = await getDocs(membersCol);
    const members = memberSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member));

    return { products, members };
}


export default async function AdminNewSalePage() {
    const { products, members } = await getTerminalData();

    return (
        <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline mb-6">Point of Sale</h2>
            <SalesTerminal allProducts={products} allMembers={members} />
        </div>
    )
}
