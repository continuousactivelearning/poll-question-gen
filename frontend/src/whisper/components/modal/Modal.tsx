import { Dialog, Transition } from "@headlessui/react";
import { Fragment, JSX } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export interface Props {
    show: boolean;
    onClose: () => void;
    onSubmit: () => void;
    submitText?: string;
    submitEnabled?: boolean;
    title: string | JSX.Element;
    content: string | JSX.Element;
}

export default function Modal({
    show,
    onClose,
    onSubmit,
    title,
    content,
    submitText,
    submitEnabled = true,
}: Props) {
    return (
        <Transition appear show={show} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* Overlay */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-50" />
                </Transition.Child>

                {/* Modal content centered */}
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 border dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg text-amber-600 dark:text-amber-400">
                                        <AlertTriangle size={20} />
                                        {title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                                    {content}
                                </CardContent>
                                <CardContent className="flex justify-end gap-2">
                                    {submitText && (
                                        <Button
                                            variant={submitEnabled ? "destructive" : "outline"}
                                            disabled={!submitEnabled}
                                            onClick={onSubmit}
                                            className="text-xs sm:text-sm"
                                        >
                                            {submitText}
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        onClick={onClose}
                                        className="text-xs sm:text-sm"
                                    >
                                        Close
                                    </Button>
                                </CardContent>
                            </Card>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
