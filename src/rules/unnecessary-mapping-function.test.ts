import { TSESLint } from "@typescript-eslint/utils";
import rule from "./unnecessary-mapping-function";

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
      ],
      output: `
        import { map } from 'lodash';

        const fruits = ['apple', 'banana', 'orange'];
        const capitalFruits = fruits.map(fruit => fruit.toUpperCase());
      `
    },
    {
      code: `
        import _ from 'lodash';

        const fruits = ['apple', 'banana', 'orange'];
        const capitalFruits = _.map(fruits, fruit => fruit.toUpperCase());
      `,
      errors: [
        {
          messageId: 'avoidMapping',
          data: { name: 'map' },
        }
      ],
      output: `
        import _ from 'lodash';

        const fruits = ['apple', 'banana', 'orange'];
        const capitalFruits = fruits.map(fruit => fruit.toUpperCase());
      `
    },
    {
      code: `
        import { filter } from 'lodash';

        const fruits = ['apple', 'banana', 'orange'];
        const fruitsWithLetterA = filter(fruits, fruit => fruit.includes('a'));
      `,
      errors: [
        {
          messageId: 'avoidMapping',
          data: { name: 'map' },
        }
      ],
      output: `
        import { filter } from 'lodash';

        const fruits = ['apple', 'banana', 'orange'];
        const fruitsWithLetterA = fruits.filter(fruit => fruit.includes('a'));
      `
    },
    {
      code: `
        import _ from 'lodash';

        const fruits = ['apple', 'banana', 'orange'];
        const fruitsWithLetterA = _.filter(fruits, fruit => fruit.includes('a'));
      `,
      errors: [
        {
          messageId: 'avoidMapping',
          data: { name: 'map' },
        }
      ],
      output: `
        import _ from 'lodash';

        const fruits = ['apple', 'banana', 'orange'];
        const fruitsWithLetterA = fruits.filter(fruit => fruit.includes('a'));
      `
    }
  ]
})

