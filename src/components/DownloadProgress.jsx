import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Clock, Download, AlertCircle, CheckCircle, Activity } from 'lucide-react';

const DownloadProgress = ({ status }) => {
    if (!status) return null;

    const {
        total,
        completed,
        failed,
        inProgress,
        startTime = Date.now(),
        errors = {}
    } = status;

    const percent = Math.round((completed / total) * 100);
    const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
    const filesPerSecond = elapsedSeconds ? (completed / elapsedSeconds).toFixed(2) : 0;
    const estimatedTimeLeft = filesPerSecond > 0
        ? Math.round(((total - completed) / filesPerSecond))
        : 0;

    return (
        <Card className="bg-white shadow-lg">
            <CardHeader>
                {/* Status Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        {inProgress ? (
                            <>
                                <Download className="w-5 h-5 text-blue-500 animate-pulse" />
                                Download in Progress
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                Download Complete
                            </>
                        )}
                    </h3>
                    <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">
                        {percent}%
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                {/* Main Progress Section */}
                <div className="space-y-6">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all duration-500 ease-out rounded-full"
                                style={{ width: `${percent}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>{completed} of {total} files</span>
                            {failed > 0 && (
                                <span className="text-red-500">
                                    {failed} failed
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 text-gray-600 mb-1">
                                <Activity className="w-4 h-4" />
                                <span className="text-sm">Speed</span>
                            </div>
                            <div className="text-lg font-semibold">
                                {filesPerSecond} files/sec
                            </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 text-gray-600 mb-1">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">Elapsed Time</span>
                            </div>
                            <div className="text-lg font-semibold">
                                {elapsedSeconds}s
                            </div>
                        </div>

                        {inProgress && estimatedTimeLeft > 0 && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm">Estimated Left</span>
                                </div>
                                <div className="text-lg font-semibold">
                                    {estimatedTimeLeft}s
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Error Summary */}
                    {failed > 0 && Object.keys(errors).length > 0 && (
                        <div className="mt-4 bg-red-50 border border-red-100 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-red-600 mb-3">
                                <AlertCircle className="w-5 h-5" />
                                <h4 className="font-medium">Download Errors</h4>
                            </div>
                            <ul className="space-y-2">
                                {Object.entries(errors).map(([error, count]) => (
                                    <li key={error} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-700">{error}</span>
                                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded">
                                            {count} {count === 1 ? 'file' : 'files'}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            {Object.keys(errors).some(e => e.includes('expired')) && (
                                <div className="mt-3 text-sm text-gray-600">
                                    📝 Note: Snapchat download links expire after 7 days.
                                    Please ensure you're using a recently exported HTML file.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Success Summary */}
                    {!inProgress && failed === 0 && (
                        <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-medium">All files downloaded successfully!</span>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default DownloadProgress;