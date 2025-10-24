import React, { useMemo } from 'react';

interface RepoAnalysisProps {
  result: string;
  title: string;
}

const RepoAnalysis: React.FC<RepoAnalysisProps> = ({ result, title }) => {
  const formattedResult = useMemo(() => {
    const lines = result.split('\n').filter(line => line.trim() !== '');
    const elements: React.ReactElement[] = [];
    let listItems: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`ul-${elements.length}`} className="list-disc pl-6 space-y-2 mb-4">
            {listItems.map((item, index) => (
              <li key={index} className="text-gray-300">{item}</li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    lines.forEach((line, index) => {
      if (line.startsWith('### ')) {
        flushList();
        elements.push(<h3 key={index} className="text-2xl font-semibold text-blue-400 mt-6 mb-3">{line.substring(4)}</h3>);
      } else if (line.startsWith('## ')) {
        flushList();
        elements.push(<h2 key={index} className="text-3xl font-bold text-purple-400 mt-8 mb-4 border-b-2 border-gray-700 pb-2">{line.substring(3)}</h2>);
      } else if (line.startsWith('- ')) {
        listItems.push(line.substring(2));
      } else {
        flushList();
        elements.push(<p key={index} className="text-gray-400 mb-4">{line}</p>);
      }
    });

    flushList(); // Add any remaining list items

    return elements;
  }, [result]);

  return (
    <div className="prose prose-invert max-w-none bg-gray-900/50 p-6 rounded-lg border border-gray-700 animate-fade-in">
        <h2 className="text-3xl font-bold text-purple-400 mt-0 mb-4 border-b-2 border-gray-700 pb-2">{title}</h2>
        {formattedResult}
    </div>
  );
};

export default RepoAnalysis;
