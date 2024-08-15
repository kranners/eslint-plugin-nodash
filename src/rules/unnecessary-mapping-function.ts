import { ASTUtils } from "@typescript-eslint/utils";
import { createRule } from ".";
import { CallExpression, FunctionExpression, Identifier, isValidCallee, MemberExpression } from "../lib/type-guards";
import { RuleContext } from "@typescript-eslint/utils/ts-eslint";
import { ReferenceTracker } from "@typescript-eslint/utils/ast-utils";

type Context = RuleContext<"avoidMapping", []>;

const applyRuleForNamedExports = ({
  callee: { name },
  tracker,
  context,
  node,
  callback,
  array,
}: {
  callee: Identifier,
  tracker: ReferenceTracker,
  context: Context,
  node: CallExpression,
  callback: FunctionExpression,
  array: Identifier,
}): void => {
  const isNamedFunctionLodash: ReferenceTracker.TraceMap = {
    lodash: {
      [ReferenceTracker.ESM]: true,
      [name]: {
        [ReferenceTracker.CALL]: true,
      }
    }
  }

  const hits = Array.from(tracker.iterateEsmReferences(isNamedFunctionLodash));

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

const applyRuleForDefaultExports = ({
  callee,
  tracker,
  context,
  node,
  callback,
  array,
}: {
  callee: MemberExpression,
  tracker: ReferenceTracker,
  context: Context,
  node: CallExpression,
  callback: FunctionExpression,
  array: Identifier,
}): void => {
  // Get the "map" part of _.map, ensure it is an identifier before continuing
  const { property } = callee;

  if (!ASTUtils.isIdentifier(property)) {
    return;
  }

  const isLodashImported: ReferenceTracker.TraceMap = {
    lodash: {
      [ReferenceTracker.ESM]: true,
      [ReferenceTracker.READ]: true,
    }
  }

  const hits = Array.from(tracker.iterateEsmReferences(isLodashImported));

  hits.forEach(() => {
    context.report({
      node,
      messageId: "avoidMapping",
      fix(fixer) {
        return fixer.replaceTextRange(
          [node.range[0], callback.range[0]],
          `${array.name}.${property.name}(`
        )
      }
    });
  })
}

export default createRule({
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
          !ASTUtils.isIdentifier(array) ||
          !ASTUtils.isFunction(callback)
        ) {
          return;
        }

        const { callee } = node;
        if (!isValidCallee(callee)) {
          return
        }

        const scope = context.sourceCode.getScope(context.sourceCode.ast);
        const arrayStaticValue = ASTUtils.getStaticValue(array, scope);
        if (!Array.isArray(arrayStaticValue?.value)) {
          return;
        }
        const tracker = new ASTUtils.ReferenceTracker(scope);

        if (ASTUtils.isIdentifier(callee)) {
          return applyRuleForNamedExports({
            callee,
            context,
            tracker,
            node,
            array,
            callback
          });
        }

        return applyRuleForDefaultExports({
          callee,
          context,
          tracker,
          node,
          array,
          callback
        });
      }
    }
  },
})

