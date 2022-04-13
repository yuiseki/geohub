import { beforeEach, expect, it } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'

import TestExample from '../TestExample.svelte'

beforeEach(cleanup)

it('shows proper heading when rendered', () => {
  const { getByText } = render(TestExample, { name: 'World' })
  expect(getByText('Hello World!')).toBeDefined()
})

it('changes button text on click', async () => {
  const { getByText } = render(TestExample, { name: 'World' })
  const button = getByText('Button')

  await fireEvent.click(button)

  expect(button.innerHTML).toContain('Button Clicked')
})