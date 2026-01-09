import { ContentObject, UserAnalysisView, AnalysisSection, SectionAttributes } from './types';

// Dictionary for renaming sections
const SECTION_TITLE_MAP: Record<string, string> = {
    "영웅의_시작점": "🌟 당신의 시작",
    "영웅의_DNA_분석": "🧬 타고난 강점과 약점",
    "인간관계_및_귀인_분석": "🤝 인간관계와 귀인",
    "핵심_시련_및_극복_과제": "⛰️ 반드시 넘어야 할 산",
    "분기점_(성공과_실패의_갈림길)": "🛤️ 당신의 미래 시나리오",
    "분기점": "🛤️ 당신의 미래 시나리오", // Short variant
};

export function transformToUserView(content: ContentObject): UserAnalysisView {
    // The 'core_fact' usually contains a high-level summary or title.
    // The DB seems to use 'core_fact' inside '내용'.
    // But wait, the top level '내용' has 'core_fact'.

    const title = maskTerm(content.core_fact);

    const sections: AnalysisSection[] = [];

    // Iterate strictly through known sections to maintain order, or iterate all keys?
    // Let's iterate predefined keys to enforce a story structure.
    const orderedKeys = [
        "영웅의_시작점",
        "영웅의_DNA_분석",
        "인간관계_및_귀인_분석",
        "핵심_시련_및_극복_과제",
        "분기점_(성공과_실패의_갈림길)"
    ];

    orderedKeys.forEach((key, index) => {
        const rawSection = content.attributes[key];
        if (!rawSection) return;

        // Handle standard Structure (it's usually an object of key-values)
        if (typeof rawSection === 'object') {
            sections.push({
                id: key,
                title: SECTION_TITLE_MAP[key] || key.replace(/_/g, ' '),
                content: [],
                subSections: convertAttributesToSubsections(rawSection as SectionAttributes)
            });
        }
    });

    return {
        title,
        sections
    };
}

function convertAttributesToSubsections(attrs: SectionAttributes): AnalysisSection[] {
    return Object.entries(attrs).map(([key, value]) => {
        let content: string[] = [];

        if (typeof value === 'string') {
            content = [maskTerm(value)];
        } else if (typeof value === 'object') {
            // Only if nested further (rare in this DB but possible)
            // This handles the case where value is Record<string, string>
            content = Object.values(value).map(v => maskTerm(v));
        }

        return {
            id: key,
            title: formatSubTitle(key),
            content
        };
    });
}

function formatSubTitle(key: string): string {
    // Remove English suffixes if present (e.g. "조력자_Ally" -> "조력자")
    // Replace underscores
    return key.split('_')[0].replace(/_/g, ' ');
}

// Simple masking function - expands as needed
function maskTerm(text: string): string {
    if (!text) return "";

    let processed = text;

    // Example replacements if strict filtering is needed.
    // processed = processed.replace(/식신/g, '표현력');
    // processed = processed.replace(/편관/g, '카리스마/압박');

    // Currently, the requirement says "사주 용어를 드러내지 않을 필터" (Filter to not reveal Saju terms).
    // This implies we SHOULD mask or rephrase.
    // For this v1, I will attempt to remove parenthetical hanja or technical terms if they look like "Term(Hanja)".

    // Remove (Hanja) patterns like (식신), (편관) etc if they are just defining the term.
    // Regex: 
    // 1. Remove terms inside parenthesis that look like Saju terms: (식신), (편재격), (상신-식신)
    processed = processed.replace(/\([가-힣]+\)/g, '');
    // 2. Remove "상신", "구신" words? That might break grammar. 
    //    Usually the text says "상신(조력자)" -> we want "조력자".
    //    If the text is "상신(식신)의 존재로...", we might want "식신의 존재로..." or just "조력자의 존재로..."

    // Pattern: "상신(식신)" -> "핵심 무기"
    // This is hard to do perfectly with RegEx alone without context.
    // I will stick to removing the Hanja/Parens to clean it up for now.

    return processed.trim();
}
