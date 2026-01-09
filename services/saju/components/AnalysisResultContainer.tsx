import React, { useEffect, useState } from 'react';
import { SajuCalculationResult, UserAnalysisView } from '../types';
import { findInterpretation } from '../interpreter';
import { transformToUserView } from '../filter';
import { AnalysisReportView } from './AnalysisReportView';

interface Props {
    calculationResult: SajuCalculationResult;
}

export const AnalysisResultContainer: React.FC<Props> = ({ calculationResult }) => {
    const [viewData, setViewData] = useState<UserAnalysisView | null>(null);

    useEffect(() => {
        // 1. Interpret
        const rawContent = findInterpretation(calculationResult);

        if (rawContent) {
            // 2. Filter & Transform
            const userView = transformToUserView(rawContent);
            setViewData(userView);
        } else {
            // Handle error or no match
            console.error("No interpretation found for", calculationResult);
        }
    }, [calculationResult]);

    if (!viewData) {
        return <div>분석 중입니다... (또는 결과를 찾을 수 없습니다)</div>;
    }

    return <AnalysisReportView data={viewData} />;
};
