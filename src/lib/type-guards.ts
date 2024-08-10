import { AST_NODE_TYPES, ASTUtils, TSESTree } from "@typescript-eslint/utils";

export type Expression = TSESTree.Expression;
export type Identifier = TSESTree.Identifier;
export type MemberExpression = TSESTree.MemberExpression;
export type CallExpression = TSESTree.CallExpression;
export type FunctionExpression = TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression;
export type Literal = TSESTree.Literal;

export const isMemberExpression = ASTUtils.isNodeOfType(AST_NODE_TYPES.MemberExpression);

export const isSpreadElement = ASTUtils.isNodeOfType(AST_NODE_TYPES.SpreadElement);

export const isLiteral = ASTUtils.isNodeOfType(AST_NODE_TYPES.Literal);

export const isValidCallee = (callee: Expression): callee is Identifier | MemberExpression => {
  return ASTUtils.isIdentifier(callee) || isMemberExpression(callee);
}

