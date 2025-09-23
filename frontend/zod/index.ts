import { z } from 'zod'

const zAttributes = z.object({
  trait_type: z.string().trim().nonempty(),
  value: z.string().trim().nonempty()
})

export const zMintNFT = z.object({
  name: z.string().trim().nonempty({ error: 'Name field is required.' }),
  collection: z.string().trim().nonempty({ error: 'Collection field is required.' }),
  description: z.string().trim().nonempty({ error: 'Description field is required.' }),
  attributes: z.array(zAttributes).min(1, { error: 'Attribute fields are required.' })
})