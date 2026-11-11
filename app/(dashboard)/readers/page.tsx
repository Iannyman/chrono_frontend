'use client';
import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

type Reader = {
    name: string;
    ip: string;
    isOnline: boolean;
    lastEventDateTime: string;
    lastError: string | null;
    updatedAt: string;

};
type ReadersResponse = {
    data: Reader[];
}

// const statusColors: Record<string, string> = {
//     "Online": "text-green-500",
//     "Offline": "text-red-500",
// };

const formatDate = (date: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
};

export default function ReadersPage() {
    const [readers, setReaders] = useState<Reader[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReaders() {
            try {
                const response = await fetch("/api/readers", {
                    method: "GET",
                    cache: "no-store",
                });
                if (!response.ok) throw new Error("Failed to fetch readers");

                const result: ReadersResponse = await response.json();
                setReaders(result.data ?? []);

                // if (result.success !== 1 || !Array.isArray(result.data)) {
                //     throw new Error("Invalid sessions data");
                // }


            } catch (error) {
                console.error(error);
                return [];
            }
        }
        fetchReaders().finally(() => setLoading(false));
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-gray-900 w-full" >
            <div className="mx-8 mt-8 mb-2">
                <h1 className="text-2xl font-bold text-white">Readers</h1>
                <p className="text-gray-400 text-sm mt-1">Manage and monitor registered readers.</p>
            </div>
            <div className="mx-8 mt-4">
                <table className="min-w-full bg-gray-800 text-white rounded-lg overflow-hidden">
                    <thead>
                        <tr className="bg-gray-700">
                            <th className="py-3 px-4 text-left">Name</th>
                            <th className="py-3 px-4 text-left">IP Address</th>
                            <th className="py-3 px-4 text-left">Status</th>
                            <th className="py-3 px-4 text-left">Last Event</th>
                            <th className="py-3 px-4 text-left">Last Error</th>
                            <th className="py-3 px-4 text-left">Updated At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td
                                    colSpan={9}
                                    className="py-8 text-center text-gray-500 text-sm"
                                >
                                    Loading readers...
                                </td>
                            </tr>
                        )}

                        {readers.map((reader) => (
                            <tr
                                key={reader.ip}
                                className="border-t border-gray-700 hover:bg-gray-700/50"
                            >
                                <td className="py-3 px-4">{reader.name}</td>
                                <td className="py-3 px-4">{reader.ip}</td>

                                <td className="py-3 px-4">
                                    <span
                                        className={`font-medium ${reader.isOnline
                                                ? "text-green-400"
                                                : "text-red-400"
                                            }`}
                                    >
                                        {reader.isOnline ? "Online" : "Offline"}
                                    </span>
                                </td>

                                <td className="py-3 px-4">
                                    {formatDate(reader.lastEventDateTime)}
                                </td>

                                <td className="py-3 px-4">
                                    {reader.lastError ?? "-"}
                                </td>

                                <td className="py-3 px-4">
                                    {formatDate(reader.updatedAt)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>


    );
};

