import 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      session_id: string
      name: string
      email: string
    }

    meals: {
      id: string
      user_id: string
      name: string
      description: string
      meal_datetime: DateTime
      in_diet: boolean
    }
  }
}
