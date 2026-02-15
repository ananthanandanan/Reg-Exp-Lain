import type { AstNode, RootNode, Features } from "regjsparser";
import type { ExplanationItem } from "../parser/astTypes";

/**
 * Converts an AST node to a human-readable explanation
 */
function nodeToExplanation(
  node: AstNode<Features>,
  nodeId: string,
): ExplanationItem {
  let text = "";

  switch (node.type) {
    case "anchor":
      if (node.kind === "start") {
        text = "Matches the start of the string (^)";
      } else if (node.kind === "end") {
        text = "Matches the end of the string ($)";
      } else if (node.kind === "boundary") {
        text = "Matches a word boundary (\\b)";
      } else {
        text = "Matches a non-word boundary (\\B)";
      }
      break;

    case "characterClass":
      const ranges = node.body
        .map((b) => {
          if (b.type === "characterClassRange") {
            const min = String.fromCodePoint(b.min.codePoint);
            const max = String.fromCodePoint(b.max.codePoint);
            return `${min} to ${max}`;
          }
          if (b.type === "value") {
            return String.fromCodePoint(b.codePoint);
          }
          if (b.type === "characterClassEscape") {
            const escapeMap: Record<string, string> = {
              d: "digits (0-9)",
              D: "non-digits",
              w: "word characters (a-z, A-Z, 0-9, _)",
              W: "non-word characters",
              s: "whitespace characters",
              S: "non-whitespace characters",
            };
            return escapeMap[b.value] || `\\${b.value}`;
          }
          return "";
        })
        .filter(Boolean)
        .join(", ");

      if (node.negative) {
        text = `Matches any character NOT in: ${ranges}`;
      } else {
        text = `Matches any character in: ${ranges}`;
      }
      break;

    case "dot":
      text = "Matches any character except newline (.)";
      break;

    case "group":
      if (node.behavior === "normal") {
        let groupInfo = `group ${node.range[0]}`;
        if (
          "name" in node &&
          node.name &&
          typeof node.name === "object" &&
          "value" in node.name
        ) {
          groupInfo = `named "${(node.name as { value: string }).value}"`;
        }
        text = `Captures ${groupInfo}: stores the matched text for later reference`;
      } else if (node.behavior === "lookahead") {
        text = "Positive lookahead: matches only if followed by the pattern";
      } else if (node.behavior === "negativeLookahead") {
        text =
          "Negative lookahead: matches only if NOT followed by the pattern";
      } else if (node.behavior === "lookbehind") {
        text = "Positive lookbehind: matches only if preceded by the pattern";
      } else if (node.behavior === "negativeLookbehind") {
        text =
          "Negative lookbehind: matches only if NOT preceded by the pattern";
      } else {
        text = "Non-capturing group: groups without storing the match";
      }
      break;

    case "quantifier":
      let quantifierText = "";
      if (node.symbol === "*") {
        quantifierText = "zero or more times";
      } else if (node.symbol === "+") {
        quantifierText = "one or more times";
      } else if (node.symbol === "?") {
        quantifierText = "zero or one time (optional)";
      } else if (node.max === undefined) {
        quantifierText = `at least ${node.min} times`;
      } else if (node.min === node.max) {
        quantifierText = `exactly ${node.min} times`;
      } else {
        quantifierText = `between ${node.min} and ${node.max} times`;
      }

      const greedyText = node.greedy ? " (greedy)" : " (non-greedy)";
      text = `Matches the preceding element ${quantifierText}${greedyText}`;
      break;

    case "disjunction":
      text = `Alternation (|): matches one of the alternatives`;
      break;

    case "value":
      const char = String.fromCodePoint(node.codePoint);
      text = `Matches the literal character "${char}"`;
      break;

    case "characterClassEscape":
      const escapeMap: Record<string, string> = {
        d: "any digit (0-9)",
        D: "any non-digit",
        w: "any word character (a-z, A-Z, 0-9, _)",
        W: "any non-word character",
        s: "any whitespace character",
        S: "any non-whitespace character",
      };
      text = `Matches ${escapeMap[node.value] || `\\${node.value}`}`;
      break;

    default:
      text = `Matches ${node.type}`;
  }

  return {
    nodeId,
    text,
    astNode: node,
  };
}

/**
 * Recursively extracts explanations from AST
 */
function extractExplanationsRecursive(
  node: AstNode<Features> | RootNode<Features>,
  nodeId: string,
  explanations: ExplanationItem[],
): void {
  explanations.push(nodeToExplanation(node, nodeId));

  if (node.type === "alternative") {
    node.body.forEach((child, index) => {
      extractExplanationsRecursive(child, `${nodeId}-${index}`, explanations);
    });
  } else if (node.type === "group") {
    node.body.forEach((child, index) => {
      extractExplanationsRecursive(child, `${nodeId}-${index}`, explanations);
    });
  } else if (node.type === "quantifier") {
    node.body.forEach((child, index) => {
      extractExplanationsRecursive(
        child,
        `${nodeId}-child-${index}`,
        explanations,
      );
    });
  } else if (node.type === "disjunction") {
    node.body.forEach((child, index) => {
      extractExplanationsRecursive(
        child,
        `${nodeId}-branch-${index}`,
        explanations,
      );
    });
  }
}

/**
 * Converts AST to explanation items
 */
export function astToExplanation(
  ast: RootNode<Features> | null,
): ExplanationItem[] {
  if (!ast) {
    return [];
  }

  const explanations: ExplanationItem[] = [];
  extractExplanationsRecursive(ast, "root", explanations);
  return explanations;
}

/**
 * Gets explanation for a specific node ID
 */
export function getNodeExplanation(
  ast: RootNode<Features> | null,
  nodeId: string,
): ExplanationItem | null {
  const explanations = astToExplanation(ast);
  return explanations.find((e) => e.nodeId === nodeId) || null;
}

/**
 * Gets explanation directly from an AST node
 */
export function getExplanationFromAstNode(
  astNode: AstNode<Features> | null,
): ExplanationItem | null {
  if (!astNode) {
    return null;
  }
  return nodeToExplanation(astNode, "direct");
}
