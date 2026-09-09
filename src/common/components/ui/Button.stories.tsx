import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = { args: { children: '主按钮' } }
export const Secondary: Story = { args: { variant: 'secondary', children: '次按钮' } }
export const Ghost: Story = { args: { variant: 'ghost', children: '幽灵按钮' } }
export const Danger: Story = { args: { variant: 'danger', children: '危险操作' } }
export const Disabled: Story = { args: { children: '禁用', disabled: true } }
