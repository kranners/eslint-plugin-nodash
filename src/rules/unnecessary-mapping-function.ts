import { ASTUtils } from "@typescript-eslint/utils";
import { createRule } from ".";
import { CallExpression, FunctionExpression, Identifier, isImportDeclaration, isImportSpecifier, isImportStatement, isMemberExpression, isObjectPattern, isProperty, isValidCallee, MemberExpression } from "../lib/type-guards";
import { RuleContext, SourceCode } from "@typescript-eslint/utils/ts-eslint";
import { isIdentifier, ReferenceTracker } from "@typescript-eslint/utils/ast-utils";
import { getMemberExpressionAncestor, isImportStatementLodash, isNodeFromImportStatement, isNodeFromLodash } from "lib/context-analysis";

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

const getES6EquivalentMethodFromCallee = (ast: SourceCode.Program, callee: Identifier | MemberExpression): string | undefined => {
  if (isMemberExpression(callee)) {
    if (isIdentifier(callee.property)) {
      return callee.property.name;
    }

    return undefined;
  }

  // If callee is not a MemberExpression it may have been renamed during its import
  const imports = ast.body.filter(isImportStatement).filter(isImportStatementLodash);

  const calleeImport = imports.find((statement) => isNodeFromImportStatement(statement, callee));
  if (calleeImport === undefined) {
    return undefined;
  }

  // ESM
  if (isImportDeclaration(calleeImport)) {
    const specifier = calleeImport.specifiers.find((specifier) => {
      return specifier.local.name === callee.name;
    });
    if (!isImportSpecifier(specifier)) {
      return undefined;
    }

    return specifier.imported.name;
  }

  // CJS
  const [declaration] = calleeImport.declarations;
  if (isObjectPattern(declaration.id)){
    const calleeProperty = declaration.id.properties.find((property) => {
      if (isIdentifier(property.value)) {
        return property.value.name === callee.name;
      }
    });

    if (!isProperty(calleeProperty) || !isIdentifier(calleeProperty.key)) {
      return undefined;
    }

    return calleeProperty.key.name;
  }
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
        if (!ASTUtils.isIdentifier(array) || !ASTUtils.isFunction(callback)) {
          return;
        }

        const { callee } = node;
        if (!isValidCallee(callee)) {
          return
        }
        
        const { ast } = context.sourceCode;
        if (!isNodeFromLodash(ast, callee)) {
          return;
        }

        const methodName = getES6EquivalentMethodFromCallee(ast, callee);
        if (methodName === undefined) {
          return;
        }

        const scope = context.sourceCode.getScope(context.sourceCode.ast);
        const arrayStaticValue = ASTUtils.getStaticValue(array, scope);
        if (!Array.isArray(arrayStaticValue?.value)) {
          return;
        }

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
      }
    }
  },
})

