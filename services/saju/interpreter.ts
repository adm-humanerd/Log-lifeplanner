import { SajuCalculationResult, SajuInterpretationDB, ContentObject, SajuCombination } from './types';
import dbData from '../../gukguk_db.json';

// Type assertion for the imported JSON to match our interface
const db = dbData as unknown as SajuInterpretationDB;

export function findInterpretation(result: SajuCalculationResult): ContentObject | null {
    const { pattern, factors } = result;

    // 1. Find the Pattern Group (e.g., "편재격")
    const group = db[pattern];
    if (!group) {
        console.warn(`Pattern not found in DB: ${pattern}`);
        return null;
    }

    // 2. Find the Match in Combinations
    // We need to find a combination where ALL specified factors match the result.
    // The DB uses "유" (Yes) / "무" (No) or specialized strings.

    const match = group.조합.find((combo: SajuCombination) => {
        // Check key factors (상신, 구신, etc.)
        // If the DB combo specifies a factor (e.g. 상신: "유"), the result must match (factors['상신'] === true).
        // If the DB combo specifies "무", result must be false.
        // If it's a content string (not '유'/'무'), we assume it acts as a 'type' matcher? 
        // Based on the file, the keys like "상신", "구신" hold "유"/"무".

        // Iterate over factors present in the Calculation Result AND the DB Combo
        // We only check keys present in the DB combo that are relevant to factors.
        const relevantKeys = ['상신', '구신', '격기신', '상신기신', '구신기신', '비견', '편인', '정재', '정관']; // Add all possible factor keys

        for (const key of relevantKeys) {
            const dbValue = combo[key];

            // If DB doesn't care about this factor, skip.
            if (!dbValue || typeof dbValue !== 'string') continue;

            const userHasFactor = factors[key];

            if (dbValue === '유' && !userHasFactor) return false;
            if (dbValue === '무' && userHasFactor) return false;
            // Note: If DB has specific string other than 유/무, we might need value matching.
            // But looking at the file it seems boolean-ish.
        }

        return true;
    });

    if (!match) {
        console.warn(`No combination found for pattern ${pattern} with factors`, factors);
        return null;
    }

    return match.내용;
}

export function getGeneralPrinciple(key: string): ContentObject | null {
    // Access the 'How' or 'Why' sections if needed
    // For now, simple getter
    const section = db['격국_작동방식_How'] || db['격국_원리_Why'];
    // Implementation depends on specific requirements for general principles.
    return null;
}
