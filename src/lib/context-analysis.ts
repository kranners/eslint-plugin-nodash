import { isIdentifier } from "@typescript-eslint/utils/ast-utils";
import { SourceCode } from "@typescript-eslint/utils/ts-eslint";
import { Identifier, ImportStatement, isImportDeclaration, isImportStatement, isLiteral, isMemberExpression, isObjectPattern, MemberExpression } from "lib/type-guards";

export const isImportStatementLodash = (statement: ImportStatement): boolean => {
  if (isImportDeclaration(statement)) {
    return statement.source.value === "lodash";
  }

  const call = statement.declarations[0].init;
  if (call.arguments.length !== 1) {
    return false;
  }

  const [required] = call.arguments;
  if (!isLiteral(required)) {
    return false;
  }

  return required.value === "lodash";
}

export const getMemberExpressionAncestor = (expression: MemberExpression): Identifier | undefined => {
  if (isIdentifier(expression.object)) {
    return expression.object;
  }

  if (isMemberExpression(expression.object)) {
    return getMemberExpressionAncestor(expression.object);
  }

  return undefined;
}

export const isNodeFromImportStatement = (statement: ImportStatement, node: Identifier | MemberExpression): boolean => {
  const target: Identifier | undefined = isIdentifier(node) ? node : getMemberExpressionAncestor(node);

  if (target === undefined) {
    return false;
  }

  if (isImportDeclaration(statement)) {
    return statement.specifiers.some((specifier) => {
      return specifier.local.name === target.name;
    });
  }

  const [declaration] = statement.declarations;
  if (isIdentifier(declaration.id)) {
    return declaration.id.name === target.name;
  }

  if (isObjectPattern(declaration.id)){
    return declaration.id.properties.some((property) => {
      if (isIdentifier(property.value)) {
        return property.value.name === target.name;
      }
    })
  }

  return false;
}

export const isNodeFromLodash = (ast: SourceCode.Program, node: Identifier | MemberExpression): boolean => {
  const imports = ast.body.filter(isImportStatement).filter(isImportStatementLodash);

  return imports.some((statement) => isNodeFromImportStatement(statement, node));
}
