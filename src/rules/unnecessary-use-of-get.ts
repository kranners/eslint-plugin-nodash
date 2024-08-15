import ts from "typescript";
import { ASTUtils, TSESTree } from "@typescript-eslint/utils";
import { createRule } from ".";
import { CallExpression, Identifier, isLiteral, isValidCallee, MemberExpression } from "../lib/type-guards";
import toPath from "lodash.topath";
import { Scope } from "@typescript-eslint/scope-manager";
import { RuleContext } from "@typescript-eslint/utils/ts-eslint";
import { isIdentifier } from "@typescript-eslint/utils/ast-utils";

type CallExpressionArgument = TSESTree.CallExpressionArgument;

type Context = RuleContext<"avoidGet", []>;

const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

const evaluateArgument = (argument: CallExpressionArgument, scope?: Scope | undefined): unknown | undefined => {
  if (isLiteral(argument)) {
    return argument.value;
  }

  if (ASTUtils.isIdentifier(argument)) {
    const staticValue = ASTUtils.getStaticValue(argument, scope);

    if (staticValue === null) {
      return undefined;
    }

    return staticValue.value;
  }

  return undefined;
}

const getCalleeName = (callee: Identifier | MemberExpression): string | undefined => {
  if (ASTUtils.isIdentifier(callee)) {
    return callee.name;
  }

  if (ASTUtils.isIdentifier(callee.property)) {
    return callee.property.name;
  }

  return undefined;
}

const questionDotToken = ts.factory.createToken(ts.SyntaxKind.QuestionDotToken);

const buildAccessExpression = (
  objectArgument: Identifier,
  path: string[],
  shouldCoalesce: boolean
): ts.Expression => {
  const objectTsExpression = ts.factory.createIdentifier(objectArgument.name);

  return path.reduce<ts.Expression>((expression, pathEntry, pathIndex) => {
    const accessToken = pathIndex !== path.length - 1 && shouldCoalesce ? questionDotToken : undefined;

    if (Number.isNaN(Number(pathEntry))) {
      return ts.factory.createPropertyAccessChain(
        expression,
        accessToken,
        ts.factory.createIdentifier(pathEntry),
      )
    }

    return ts.factory.createElementAccessChain(
      expression,
      accessToken,
      ts.factory.createNumericLiteral(pathEntry),
    );
  }, objectTsExpression);
}

const getThirdArgumentSource = (callExpression: CallExpression, context: Context): string | undefined => {
  if (callExpression.arguments.length !== 3) {
    return undefined;
  }

  return context.sourceCode.getText(callExpression.arguments[2])
}

export default createRule({
  name: "unnecessary-use-of-get",
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unnecessary use of get() over accessors',
      recommended: 'recommended',
    },
    schema: [],
    messages: {
      avoidGet: "Avoid using lodash get when null coalescing exists"
    },
    hasSuggestions: true,
    fixable: "code",
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (node.arguments.length < 2 || node.arguments.length > 3) {
          return;
        }

        const [objectArgument, pathArgument] = node.arguments;

        if (!isValidCallee(node.callee)) {
          return;
        }

        if (!isIdentifier(objectArgument)) {
          return;
        }

        const calleeName = getCalleeName(node.callee);

        if (calleeName !== "get") {
          return;
        }

        const scope = context.sourceCode.getScope(context.sourceCode.ast);
        const pathValue = evaluateArgument(pathArgument, scope);

        if (typeof pathValue !== "string") {
          return;
        }

        const path = toPath(pathValue);

        const defaultValueSource = getThirdArgumentSource(node, context);
        const shouldCoalesce = defaultValueSource !== undefined;

        const replacementAccessExpression = buildAccessExpression(
          objectArgument, path, shouldCoalesce
        );

        const replacementAccessExpressionText = printer.printNode(
          ts.EmitHint.Unspecified,
          replacementAccessExpression,
          ts.createSourceFile(context.filename, context.sourceCode.text, ts.ScriptTarget.Latest, true),
        )

        context.report({
          node,
          messageId: "avoidGet",
          fix(fixer) {
            if (shouldCoalesce) {
              return fixer.replaceText(node, `${replacementAccessExpressionText} ?? ${defaultValueSource}`);
            }

            return fixer.replaceText(node, replacementAccessExpressionText);
          }
        });
      }
    }
  }
})

