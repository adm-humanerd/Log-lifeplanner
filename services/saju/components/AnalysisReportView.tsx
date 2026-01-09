import React from 'react';
import { UserAnalysisView, AnalysisSection } from '../types';

interface Props {
    data: UserAnalysisView;
}

export const AnalysisReportView: React.FC<Props> = ({ data }) => {
    return (
        <div className="saju-report-container p-6 bg-white rounded-lg shadow-lg max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">{data.title}</h1>

            <div className="space-y-8">
                {data.sections.map((section) => (
                    <SectionCard key={section.id} section={section} />
                ))}
            </div>
        </div>
    );
};

const SectionCard: React.FC<{ section: AnalysisSection }> = ({ section }) => {
    return (
        <div className="section-card border-l-4 border-indigo-500 pl-4 py-2">
            <h2 className="text-xl font-semibold text-indigo-700 mb-3">{section.title}</h2>

            <div className="space-y-2 text-gray-700 leading-relaxed">
                {Array.isArray(section.content) ? (
                    section.content.map((text, idx) => <p key={idx}>{text}</p>)
                ) : (
                    <p>{section.content}</p>
                )}
            </div>

            {section.subSections && section.subSections.length > 0 && (
                <div className="mt-4 pl-4 space-y-4">
                    {section.subSections.map(sub => (
                        <div key={sub.id}>
                            <h3 className="text-lg font-medium text-gray-800 mb-1">{sub.title}</h3>
                            <div className="text-sm text-gray-600">
                                {Array.isArray(sub.content) ? (
                                    sub.content.map((text, idx) => <p key={idx}>{text}</p>)
                                ) : (
                                    <p>{sub.content}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
