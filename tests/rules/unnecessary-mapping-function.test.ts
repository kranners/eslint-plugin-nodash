import { TSESLint } from "@typescript-eslint/utils";
import { rule } from "../../src/rules/unnecessary-mapping-function";

const ruleTester = new TSESLint.RuleTester();

ruleTester.run('unnecessary-mapping-function', rule, {
  valid: [
    {
      code: `
        const fruits = ['apple', 'banana', 'orange'];
        const capitalFruits = fruits.map(fruit => fruit.toUpperCase());
      `,
    },
    {
      code: `
        const map = (mappable, callback) => mappable.map(callback);

        const fruits = ['apple', 'banana', 'orange'];
        const capitalFruits = map(fruits, fruit => fruit.toUpperCase());
      `,
    },
    {
      code: `
        import { mergeDeep } from 'lodash';

        const map = (mappable, callback) => mappable.map(callback);

        const fruits = ['apple', 'banana', 'orange'];
        const capitalFruits = map(fruits, fruit => fruit.toUpperCase());
      `,
    }
  ],
  invalid: [
    {
      code: `
        import { map } from 'lodash';

        const fruits = ['apple', 'banana', 'orange'];
        const capitalFruits = map(fruits, fruit => fruit.toUpperCase());
      `,
      errors: [
        {
          messageId: 'avoidMapping',
          data: { name: 'map' },
        }
      ]
    }
  ]
})

