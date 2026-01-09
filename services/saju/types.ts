export interface SajuCalculationResult {
    pattern: string; // e.g., "편재격", "상관격"
    factors: {
        [key: string]: boolean; // e.g., { 상신: true, 구신: true, 비견: false, ... }
    };
}

export interface SectionAttributes {
    [key: string]: string | Record<string, string>;
}

export interface ContentObject {
    core_fact: string;
    attributes: {
        영웅의_시작점?: SectionAttributes;
        영웅의_DNA_분석?: SectionAttributes;
        인간관계_및_귀인_분석?: SectionAttributes;
        핵심_시련_및_극복_과제?: SectionAttributes;
        분기점?: SectionAttributes;
        [key: string]: SectionAttributes | string | undefined;
    };
}

export interface SajuCombination {
    상신?: string;
    구신?: string;
    격기신?: string;
    상신기신?: string;
    비견?: string;
    편인?: string;
    정재?: string;
    정관?: string;
    // Dynamic keys for factors are possible, these are common ones found in the DB.
    // Ideally, we treat them as a map to check against calculation result.
    [key: string]: string | ContentObject | undefined;

    내용: ContentObject;
}

export interface SajuInterpretationDB {
    [patternName: string]: {
        구성요소: Record<string, string>;
        조합: SajuCombination[];
    };
}

// User Facing View Models
export interface UserAnalysisView {
    title: string;
    sections: AnalysisSection[];
}

export interface AnalysisSection {
    id: string;
    title: string;
    content: string | string[];
    subSections?: AnalysisSection[];
}
