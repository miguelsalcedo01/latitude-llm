import { text, timestamp } from 'drizzle-orm/pg-core'

import { latitudeSchema } from '../db-schema'
import { timestamps } from '../schemaHelpers'

export const users = latitudeSchema.table('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull().unique(),
  confirmedAt: timestamp('confirmed_at'),
  encryptedPassword: text('encrypted_password'),
  ...timestamps(),
})
