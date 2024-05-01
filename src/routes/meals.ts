import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../lib/knex'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [checkSessionIdExists] }, async (request) => {
    const meals = await knex('meals')
      .where({
        user_id: request.user?.id,
      })
      .orderBy('meal_datetime', 'desc')

    return { meals }
  })

  app.get(
    '/:mealId',
    { preHandler: [checkSessionIdExists] },
    async (request) => {
      const paramsSchema = z.object({
        mealId: z.string().uuid(),
      })

      const { mealId } = paramsSchema.parse(request.params)

      const meal = await knex('meals')
        .where({
          id: mealId,
          user_id: request.user?.id,
        })
        .orderBy('meal_datetime', 'desc')
        .first()

      return { meal }
    },
  )

  app.get(
    '/metrics',
    { preHandler: [checkSessionIdExists] },
    async (request) => {
      const totalMeals = await knex('meals').where({
        user_id: request.user?.id,
      })

      const totalMealsOnDiet = await knex('meals')
        .where({ in_diet: true, user_id: request.user?.id })
        .count('id', { as: 'total' })
        .first()

      const totalMealsOffDiet = await knex('meals')
        .where({ in_diet: false, user_id: request.user?.id })
        .count('id', { as: 'total' })
        .first()

      const { bestOnDietSequence } = totalMeals.reduce(
        (acc, meal) => {
          if (meal.in_diet) {
            acc.currentSequence += 1
          } else {
            acc.currentSequence = 0
          }

          if (acc.currentSequence > acc.bestOnDietSequence) {
            acc.bestOnDietSequence = acc.currentSequence
          }

          return acc
        },
        { bestOnDietSequence: 0, currentSequence: 0 },
      )

      return {
        totalMeals: totalMeals.length,
        totalMealsOnDiet: totalMealsOnDiet?.total,
        totalMealsOffDiet: totalMealsOffDiet?.total,
        bestOnDietSequence,
      }
    },
  )

  app.post(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        mealDatetime: z.coerce.date(),
        inDiet: z.boolean(),
      })

      const { name, description, mealDatetime, inDiet } =
        createMealBodySchema.parse(request.body)

      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        meal_datetime: mealDatetime.getTime(),
        in_diet: inDiet,
        user_id: request.user?.id,
      })

      return reply.status(201).send()
    },
  )

  app.put(
    '/:mealId',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const paramsSchema = z.object({
        mealId: z.string().uuid(),
      })

      const { mealId } = paramsSchema.parse(request.params)

      const updateMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        mealDatetime: z.coerce.date(),
        inDiet: z.boolean(),
      })

      const { name, description, mealDatetime, inDiet } =
        updateMealBodySchema.parse(request.body)

      const meal = await knex('meals').where({ id: mealId }).first()

      if (!meal) {
        return reply.status(404).send({ error: 'Meal not found' })
      }

      await knex('meals')
        .where({
          id: mealId,
          user_id: request.user?.id,
        })
        .update({
          name,
          description,
          meal_datetime: mealDatetime.getTime(),
          in_diet: inDiet,
        })

      return reply.status(204).send()
    },
  )

  app.delete(
    '/:mealId',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const paramsSchema = z.object({
        mealId: z.string().uuid(),
      })

      const { mealId } = paramsSchema.parse(request.params)

      const meal = await knex('meals').where({ id: mealId }).first()

      if (!meal) {
        return reply.status(404).send({ error: 'Meal not found' })
      }

      await knex('meals')
        .where({
          id: mealId,
          user_id: request.user?.id,
        })
        .delete()

      return reply.status(204).send()
    },
  )
}
