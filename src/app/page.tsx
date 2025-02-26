import Image from "next/image";
import BPOSecurityTest from "@/components/BPOSecurityTest";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">BPO Security Framework</h1>
      <BPOSecurityTest />
    </div>
  );
}
