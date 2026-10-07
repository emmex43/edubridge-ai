import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface FormattedMessageProps {
    content: string;
}

/**
 * Typed overrides rather than `any`. Note that react-markdown passes a `node`
 * prop alongside the HTML attributes; the previous version spread all of it
 * onto the DOM element, which leaked `node` into the rendered markup.
 */
const components: Components = {
    // Block code gets its own scroll container, so a long line never widens
    // the chat bubble.
    pre({ children }) {
        return (
            <div className="overflow-x-auto rounded-md bg-slate-900 p-3 my-2 shadow-inner">
                <pre className="bg-transparent p-0 m-0">{children}</pre>
            </div>
        );
    },

    code({ className, children }) {
        // A fenced block either carries a `language-*` class or spans lines;
        // anything else is inline code.
        const isBlock = /language-\w+/.test(className ?? '') || String(children).includes('\n');

        return isBlock ? (
            <code className="text-sm text-slate-50 font-mono">{children}</code>
        ) : (
            <code className="bg-gray-200 text-pink-600 px-1.5 py-0.5 rounded font-mono text-xs">
                {children}
            </code>
        );
    },
};

export default function FormattedMessage({ content }: FormattedMessageProps) {
    return (
        <div className="prose prose-sm max-w-none prose-p:leading-relaxed">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={components}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
