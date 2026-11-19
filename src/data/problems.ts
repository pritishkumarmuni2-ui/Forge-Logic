import type { TopicId } from '../types/interview';

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  statement: string[];
  examples: Example[];
  constraints: string[];
  followUp: string;
}

export const INTERVIEW_STAGES: { id: TopicId; stage: string; title: string }[] = [
  { id: 'loop-choice', stage: 'Q1', title: 'Loop selection & rationale' },
  { id: 'termination', stage: 'Q2', title: 'Iteration mechanics & termination' },
  { id: 'complexity', stage: 'Q3', title: 'Time complexity & trade-offs' },
  { id: 'edge-cases', stage: 'Q4', title: 'Duplicates & no-solution inputs' },
  { id: 'tradeoffs', stage: 'Q5', title: 'Memory vs. runtime trade-offs' },
];

export const TWO_SUM: Problem = {
  id: 'two-sum',
  title: 'Two Sum',
  difficulty: 'Easy',
  tags: ['Array', 'Hash Table'],
  statement: [
    'Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`.',
    'You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    'You can return the answer in any order.',
  ],
  examples: [
    {
      input: 'nums = [2, 7, 11, 15], target = 9',
      output: '[0, 1]',
      explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
    },
    {
      input: 'nums = [3, 2, 4], target = 6',
      output: '[1, 2]',
    },
    {
      input: 'nums = [3, 3], target = 6',
      output: '[0, 1]',
    },
  ],
  constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9', 'Only one valid answer exists.'],
  followUp: 'Can you come up with an algorithm that is less than O(n²) time complexity?',
};

export const STARTER_CODE = `function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return [];
}
`;
