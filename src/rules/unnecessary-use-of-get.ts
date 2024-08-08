import { createRule } from ".";

export const rule = createRule({
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
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (node.arguments.length > 3 || node.arguments.length < 2) {
          return;
        }

        const [object, path, defaultValue] = node.arguments;
      }
    }
  }
})
