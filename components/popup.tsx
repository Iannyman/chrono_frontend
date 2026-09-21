import React from "react";

export type EmployeeSession = {
    person_id: number;
    person_last_name: string;
    person_first_name: string;
    line_id: number;
    line_name: string;
    log_id: number;
    login_timestamp: string;
    logout_timestamp: string | null;
    shift_name: string;
    session_minutes: number;
    isLive?: boolean;
}


type PopupProps = {
    display: "bottom";
    isOpen: boolean;
    session: EmployeeSession | null;
    productionLines: string[];
    onClose: () => void;
    save: (session: EmployeeSession) => Promise<void>;
    deleteSession: (log_id: number) => Promise<void>;
};

const Popup: React.FC<PopupProps> = ({ isOpen, session, onClose, save, deleteSession, productionLines }) => {

    console.log("Popup:", isOpen, session);
    const [line, setLine] = React.useState(session?.line_name || "");
    const [date, setDate] = React.useState(session ? new Date(session.login_timestamp).toLocaleDateString("en-US") : "-");
    const [loginTime, setLoginTime] = React.useState(session ? new Date(session.login_timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }) : "-");
    const [logoutTime, setLogoutTime] = React.useState(session?.logout_timestamp ? new Date(session.logout_timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }) : "-");


    // async function editSession(updatedSession: EmployeeSession) {
    //     try {
    //         const response = await fetch("API", {
    //             method: "PUT",
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify(updatedSession),
    //         });

    //         if (!response.ok) {
    //             throw new Error("Failed to update session");
    //         }

    //         const result = await response.json();

    //         console.log("Session updated:", result);

    //         save(updatedSession);
    //         onClose();
    //     } catch (error) {
    //         console.error("Failed to update session: ", error)
    //     }
    // }


    React.useEffect(() => {
        if (!session) return;
        setLine(session.line_name);
        setDate(new Date(session.login_timestamp).toLocaleDateString("en-US"));
        setLoginTime(new Date(session.login_timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }));
        setLogoutTime(session.logout_timestamp ? new Date(session.logout_timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }) : "-");
    }, [session]);

    if (!isOpen || !session) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
            <div className="w-96 bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Edit Session</h2>
                <p className="text-gray-400 mb-2">
                    <strong>Person ID: </strong>
                    <input type="text" value={session?.person_id} readOnly />
                </p>
                <p className="text-gray-400 mb-2">
                    <strong>Name: </strong>
                    <input type="text" value={`${session?.person_first_name} ${session?.person_last_name}`} readOnly />
                </p>
                <p className="text-white mb-2">
                    <strong>Line: </strong>
                    {/* <input type="dropdown" readOnly={false} onChange={(e) => setLine(e.target.value)}  /> */}

                    <select
                        value={line}
                        onChange={(e) => setLine(e.target.value)}
                        className="mt-1 bg-gray-700 rounded-lg shadow-lg border border-gray-600 py-1">
                        <option value="">Select a line</option>

                        {productionLines.map((lineName, index) => (

                            <option key={index} value={lineName}>
                                {lineName}
                            </option>
                        ))}
                    </select>

                </p>
                <p className="text-white mb-2">
                    <strong>Date: </strong>
                    <input type="text" value={date} readOnly={false} onChange={(e) => setDate(e.target.value)} />

                </p>
                <p className="text-white mb-2">
                    <strong>Login: </strong>
                    <input type="text" value={loginTime} readOnly={false} onChange={(e) => setLoginTime(e.target.value)} />
                </p>
                <p className="text-white mb-2">
                    <strong>Logout: </strong>
                    <input type="text" value={logoutTime} readOnly={false} onChange={(e) => setLogoutTime(e.target.value)} />
                </p>

                <div className="text-white mb-2  flex justify-between">
                    <button
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={async () => {
                            const updatedSession: EmployeeSession = {
                                ...session,
                                line_name: line,
                                login_timestamp: new Date(
                                    `${date} ${loginTime}`
                                ).toISOString(),
                                logout_timestamp:
                                    logoutTime && logoutTime !== "-"
                                        ? new Date(`${date} ${logoutTime}`).toISOString()
                                        : null,
                            };

                            await save(updatedSession);

                            onClose();
                        }}
                    >
                        Save
                    </button>

                    <button
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={
                            async () => {
                                await deleteSession(session.log_id);
                            }
                        }
                    >
                        Delete
                    </button>

                    <button
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Popup;
