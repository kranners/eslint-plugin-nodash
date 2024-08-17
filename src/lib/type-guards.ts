import { AST_NODE_TYPES, ASTUtils, TSESTree } from "@typescript-eslint/utils";
import { isIdentifier } from "@typescript-eslint/utils/ast-utils";

export type Expression = TSESTree.Expression;
export type Identifier = TSESTree.Identifier;
export type MemberExpression = TSESTree.MemberExpression;
export type CallExpression = TSESTree.CallExpression;
export type FunctionExpression = TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression;
export type Literal = TSESTree.Literal;
export type LogicalExpression = TSESTree.LogicalExpression;

export const isLogicalExpression = ASTUtils.isNodeOfType(AST_NODE_TYPES.LogicalExpression);
export const isMemberExpression = ASTUtils.isNodeOfType(AST_NODE_TYPES.MemberExpression);
export const isSpreadElement = ASTUtils.isNodeOfType(AST_NODE_TYPES.SpreadElement);
export const isLiteral = ASTUtils.isNodeOfType(AST_NODE_TYPES.Literal);
export const isImportDeclaration = ASTUtils.isNodeOfType(AST_NODE_TYPES.ImportDeclaration);
export const isVariableDeclaration = ASTUtils.isNodeOfType(AST_NODE_TYPES.VariableDeclaration);
export const isCallExpression = ASTUtils.isNodeOfType(AST_NODE_TYPES.CallExpression);
export const isImportDefaultSpecifier = ASTUtils.isNodeOfType(AST_NODE_TYPES.ImportDefaultSpecifier);
export const isImportSpecifier = ASTUtils.isNodeOfType(AST_NODE_TYPES.ImportSpecifier);
export const isObjectPattern = ASTUtils.isNodeOfType(AST_NODE_TYPES.ObjectPattern);

export const isValidCallee = (callee: Expression): callee is Identifier | MemberExpression => {
  return ASTUtils.isIdentifier(callee) || isMemberExpression(callee);
}

export type CommonJSImport = TSESTree.VariableDeclaration & {
  declarations: [
    TSESTree.VariableDeclarator & {
      init: TSESTree.CallExpression & {
        callee: TSESTree.Identifier & {
          name: "require"
        }
      }
    }
  ]
};

export type ImportStatement = TSESTree.ImportDeclaration | CommonJSImport;

export const isImportStatement = (statement: TSESTree.ProgramStatement): statement is ImportStatement => {
  if (isImportDeclaration(statement)) {
    return true;
  }

  if (!isVariableDeclaration(statement)) {
    return false;
  }

  if (statement.declarations.length !== 1) {
    return false;
  }

  const [declaration] = statement.declarations;

  if (!isCallExpression(declaration.init)) {
    return false;
  }

  if (!isIdentifier(declaration.init.callee)) {
    return false;
  }

  return declaration.init.callee.name === "require";
}
