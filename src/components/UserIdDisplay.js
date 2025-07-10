import React, { useState } from 'react';
import { Clipboard, Check } from 'lucide-react';

const UserIdDisplay = ({ userId }) => {
    const [copied, setCopied] = useState(false);
    if (!userId) return null;

    const copyToClipboard = () => {
        const el = document.createElement('textarea');
        el.value = userId;
        document.body.appendChild(el);
        el.select();
        try {
            document.execCommand('copy');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
        document.body.removeChild(el);
    };

    return (
        <div className="fixed top-4 right-4 bg-white p-2 rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 font-mono" title="Your unique session ID">ID: {userId}</span>
                <button onClick={copyToClipboard} className="p-1 text-gray-500 hover:text-green-600">
                    {copied ? <Check size={16} className="text-green-500" /> : <Clipboard size={16} />}
                </button>
            </div>
        </div>
    );
};

export default UserIdDisplay;
