import { parse, type RootNode, type Features } from 'regjsparser';
import type { AstNode } from './astTypes';

export interface ParseResult {
    ast: RootNode<Features> | null;
    error: string | null;
}

/**
 * Parses a regex string into an AST using regjsparser
 */
export function parseRegex(
    regexString: string,
    flags: string = ''
): ParseResult {
    try {
        // Remove leading/trailing slashes if present
        let cleanedRegex = regexString.trim();
        let cleanedFlags = flags;

        // Handle regex literals like /pattern/flags
        if (cleanedRegex.startsWith('/')) {
            const lastSlash = cleanedRegex.lastIndexOf('/');
            if (lastSlash > 0) {
                cleanedFlags = cleanedRegex.slice(lastSlash + 1);
                cleanedRegex = cleanedRegex.slice(1, lastSlash);
            }
        }

        // Configure features based on flags
        const features: Features = {
            lookbehind: true,
            namedGroups: cleanedFlags.includes('n') || true, // Assume named groups supported
            unicodePropertyEscape: true,
            unicodeSet: false,
            modifiers: false,
        };

        const ast = parse(cleanedRegex, cleanedFlags, features);
        return { ast, error: null };
    } catch (error) {
        return {
            ast: null,
            error: error instanceof Error ? error.message : 'Unknown parsing error',
        };
    }
}

/**
 * Extracts flags from a regex string
 */
export function extractFlags(regexString: string): string {
    const trimmed = regexString.trim();
    if (trimmed.startsWith('/')) {
        const lastSlash = trimmed.lastIndexOf('/');
        if (lastSlash > 0) {
            return trimmed.slice(lastSlash + 1);
        }
    }
    return '';
}
