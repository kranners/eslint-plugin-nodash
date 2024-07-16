import { ASTUtils } from "@typescript-eslint/utils";
import { ReferenceTracker } from "@typescript-eslint/utils/ast-utils";
import { createRule } from ".";

export const rule = createRule({
  name: "unnecessary-mapping-function",
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unnecessary use of lodash mapping function',
      recommended: 'recommended',
    },
    schema: [],
    messages: {
      avoidMapping: "Avoid using lodash mapping functions with existing equivalents"
    },
    hasSuggestions: true,
    fixable: "code",
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (node.arguments.length !== 2) {
          return;
        }

        const [array, callback] = node.arguments;

        if (
          !ASTUtils.isIdentifier(node.callee) ||
          !ASTUtils.isIdentifier(array) ||
          !ASTUtils.isFunction(callback)
        ){
          return;
        }

        const name = node.callee.name;
        const scope = context.sourceCode.getScope(context.sourceCode.ast);

        const arrayStaticValue = ASTUtils.getStaticValue(array, scope);

        if (!Array.isArray(arrayStaticValue?.value)) {
          return;
        }

        const tracker = new ASTUtils.ReferenceTracker(scope);

        const isFunctionFromLodash: ReferenceTracker.TraceMap = {
          lodash: {
            [ReferenceTracker.ESM]: true,
            [name]: {
              [ReferenceTracker.CALL]: true,
            }
          }
        }

        const hits = Array.from(tracker.iterateEsmReferences(
          isFunctionFromLodash
        ));

        hits.forEach(() => {
          context.report({
            node,
            messageId: "avoidMapping",
            data: { name },
            fix(fixer) {
              return fixer.replaceTextRange(
                [node.range[0], callback.range[0]],
                `${array.name}.${name}(`
              )
            }
          });
        })
      }
    }
  },
})
