import { fail } from '@sveltejs/kit'
export const actions = {
  save: async (event) => {
    const { request, locals } = event
    const session = await locals.getSession()
    if (!session) {
      return fail(403, { message: 'No permission' })
    }
    const data = await request.formData()
    const settings: { [key: string]: string } = {}
    for (const [key, value] of data.entries()) {
      settings[key] = value
    }
    const response = await event.fetch('/api/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    })
    if (response.ok) {
      return {
        status: 200,
        body: { message: 'Settings saved' },
      }
    }
    return fail(500, { message: 'Failed to save settings' })
  },
}