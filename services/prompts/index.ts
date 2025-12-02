// Central registry of all available formatting styles
import { standardPremiumPrompt, styleMetadata as standardMeta } from './standardPremium';
import { juridicalElitePrompt, styleMetadata as juridicalMeta } from './juridicalElite';
import { magazineModernPrompt, styleMetadata as magazineMeta } from './magazineModern';
import { minimalistZenPrompt, styleMetadata as zenMeta } from './minimalistZen';
import { techManualPrompt, styleMetadata as techMeta } from './techManual';

export type StyleId = 'standard-premium' | 'juridical-elite' | 'magazine-modern' | 'minimalist-zen' | 'tech-manual';

export interface StyleDefinition {
    id: StyleId;
    metadata: {
        name: string;
        description: string;
        category: string;
        bestFor: string[];
    };
    getPrompt: (language: 'pt' | 'en', preserveContent: boolean) => string;
}

export const styles: Record<StyleId, StyleDefinition> = {
    'standard-premium': {
        id: 'standard-premium',
        metadata: standardMeta,
        getPrompt: standardPremiumPrompt
    },
    'juridical-elite': {
        id: 'juridical-elite',
        metadata: juridicalMeta,
        getPrompt: juridicalElitePrompt
    },
    'magazine-modern': {
        id: 'magazine-modern',
        metadata: magazineMeta,
        getPrompt: magazineModernPrompt
    },
    'minimalist-zen': {
        id: 'minimalist-zen',
        metadata: zenMeta,
        getPrompt: minimalistZenPrompt
    },
    'tech-manual': {
        id: 'tech-manual',
        metadata: techMeta,
        getPrompt: techManualPrompt
    }
};

// Helper to get all styles as array
export const getAllStyles = (): StyleDefinition[] => Object.values(styles);

// Helper to get style by ID
export const getStyleById = (id: StyleId): StyleDefinition | undefined => styles[id];

// Backward compatibility mapping
export const legacyModeToStyleId = (mode: 'standard' | ' juridical'): StyleId => {
    return mode === 'juridical' ? 'juridical-elite' : 'standard-premium';
};
