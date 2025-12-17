export default function Loading() {
    return (
        <div className="min-h-screen bg-bbro-background p-10 animate-pulse">
            <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Sinistra: Form Skeleton */}
                <div className="bg-white p-8 rounded-sm shadow-sm border-t-4 border-gray-200">
                    <div className="h-8 w-1/2 bg-gray-200 rounded mb-6"></div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="h-10 bg-gray-100 rounded"></div>
                            <div className="h-10 bg-gray-100 rounded"></div>
                        </div>
                        <div className="h-10 bg-gray-100 rounded"></div>
                        <div className="h-10 bg-gray-100 rounded"></div>
                    </div>
                </div>

                {/* Destra: Immobili Skeleton */}
                <div>
                    <div className="h-8 w-1/2 bg-gray-200 rounded mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-32 bg-white rounded-sm shadow-sm border-l-4 border-gray-200"></div>
                        <div className="h-32 bg-white rounded-sm shadow-sm border-l-4 border-gray-200"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
