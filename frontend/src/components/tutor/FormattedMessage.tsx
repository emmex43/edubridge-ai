import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface FormattedMessageProps {
    content: string;
}

export default function FormattedMessage({ content }: FormattedMessageProps) {
    return (
        <div className="prose prose-sm max-w-none prose-p:leading-relaxed">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    // 1. Handle the outer wrapper for block code (never nested in <p>)
                    pre({ node, children, ...props }: any) {
                        return (
                            <div className="overflow-x-auto rounded-md bg-slate-900 p-3 my-2 shadow-inner">
                                <pre className="bg-transparent p-0 m-0" {...props}>
                                    {children}
                                </pre>
                            </div>
                        );
                    },
                    // 2. Handle the text inside block code OR inline code
                    code({ node, className, children, ...props }: any) {
                        // Check if it's a code block (has a language class or contains a newline)
                        const match = /language-(\w+)/.exec(className || '');
                        const isBlock = match || String(children).includes('\n');

                        return isBlock ? (
                            <code className="text-sm text-slate-50 font-mono" {...props}>
                                {children}
                            </code>
                        ) : (
                            // Inline code styling
                            <code className="bg-gray-200 text-pink-600 px-1.5 py-0.5 rounded font-mono text-xs" {...props}>
                                {children}
                            </code>
                        );
                    }
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}