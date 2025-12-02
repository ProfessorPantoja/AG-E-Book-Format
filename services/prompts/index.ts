/**
 * MODULAR PROMPT SYSTEM - Central Registry
 * 
 * This file is the "brain" that knows about all available formatting styles.
 * 
 * ARCHITECTURE PATTERN: Registry Pattern
 * Instead of hardcoding prompts in geminiService.ts, we maintain a central registry.
 * This makes it trivial to add new styles: just create a new file and register it here.
 * 
 * HOW TO ADD A NEW STYLE:
 * 1. Create services/prompts/myNewStyle.ts
 * 2. Export a prompt function: (language, preserveContent) => string
 * 3. Export a styleMetadata object with name, description, category, bestFor
 * 4. Import both here and add to the `styles` object
 * 5. Update the StyleId type to include your new ID
 * 
 * DESIGN DECISION: Why not dynamic imports?
 * We could use dynamic imports to auto-discover prompt files, but:
 * - TypeScript type safety would be harder to maintain
 * - Explicit registration makes dependencies clear
 * - Build tools can tree-shake unused prompts
 */

import { standardPremiumPrompt, styleMetadata as standardMeta } from './standardPremium';
import { juridicalElitePrompt, styleMetadata as juridicalMeta } from './juridicalElite';
import { magazineModernPrompt, styleMetadata as magazineMeta } from './magazineModern';
import { minimalistZenPrompt, styleMetadata as zenMeta } from './minimalistZen';
import { techManualPrompt, styleMetadata as techMeta } from './techManual';

// TYPE DEFINITION: All available style IDs
// This creates a union type that enforces correctness at compile-time.
export type StyleId = 'standard-premium' | 'juridical-elite' | 'magazine-modern' | 'minimalist-zen' | 'tech-manual';

// INTERFACE: What every style definition must provide
export interface StyleDefinition {
    id: StyleId;
    metadata: {
        name: string; // Display name for UI
        description: string; // What this style does
        category: string; // Grouping (e.g., "Academic", "Modern")
        bestFor: string[]; // Use cases
    };
    getPrompt: (language: 'pt' | 'en', preserveContent: boolean) => string;
}

// THE REGISTRY
// This is a Record (typed object) mapping each StyleId to its definition.
// The 'Record' type ensures every StyleId has an entry.
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

// UTILITY: Get all styles as an array (useful for building UI dropdowns)
export const getAllStyles = (): StyleDefinition[] => Object.values(styles);

// UTILITY: Get a single style by ID
export const getStyleById = (id: StyleId): StyleDefinition | undefined => styles[id];

// BACKWARD COMPATIBILITY
// Old code used 'standard' and 'juridical' strings.
// We map them to the new StyleId system to avoid breaking existing code.
// TODO: Search codebase for usages of 'standard'/'juridical' and refactor to use StyleIds directly.
export const legacyModeToStyleId = (mode: 'standard' | 'juridical'): StyleId => {
    return mode === 'juridical' ? 'juridical-elite' : 'standard-premium';
};
