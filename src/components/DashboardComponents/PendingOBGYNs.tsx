import { Link } from "react-router-dom";

const pendingDoctors = [
    {
      name: "Dr. Maria Clara Infantes",
      email: "mariaclara.infantes@gmail.com",
      submitted: "Sep 1, 2025"
    },
    {
      name: "Dr. Maria Clara Infantes",
      email: "mariaclara.infantes@gmail.com",
      submitted: "Sep 1, 2025"
    }
]

export default function PendingOBGYNs() {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Pending OB-GYNs</h3>
                    <p className="text-sm text-gray-500">For Verification & Approval</p>
                </div>
                <Link
                to="aprrovals-list"
                className="text-sm font-medium text-red-500 hover:text-pink-600"
                >
                View All
                </Link>
            </div>
            <div className="space-y-4">
                {pendingDoctors.map((doctor, index) => (
                    <div key={index} className="border rounded-lg p-4">
                        <p className="font-semibold text-gray-800 text-sm">{doctor.name}</p>
                        <p className="text-xs text-gray-400">{doctor.email}</p>
                        <p className="text-xs text-gray-400 mt-1">Submitted: {doctor.submitted}</p>
                        <div className="flex items-center space-x-2 mt-3">
                            <button className="flex-1 bg-white border border-gray-300 text-gray-700 text-xs font-semibold py-2 px-3 rounded-md hover:bg-gray-50">
                                View Details
                            </button>
                             <button className="flex-1 bg-red-500 text-white text-xs font-semibold py-2 px-3 rounded-md hover:bg-red-600">
                                Approve
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
