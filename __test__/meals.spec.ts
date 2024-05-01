import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to list all meals', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Jhon Doe',
      email: 'jhondoe@example.com',
    })

    const cookies = createUserResponse.get('Set-cookie')!

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Ref 1',
        description: 'A melhor do mundo',
        mealDatetime: '2024-05-01T21:05:55.809Z',
        inDiet: true,
      })
      .expect(201)

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    expect(listMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        name: 'Ref 1',
        description: 'A melhor do mundo',
        meal_datetime: 1714597555809,
        in_diet: 1,
      }),
    ])
  })

  it('should be able to get specific meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Jhon Doe',
      email: 'jhondoe@example.com',
    })

    const cookies = createUserResponse.get('Set-cookie')!

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Ref 1',
        description: 'A melhor do mundo',
        mealDatetime: '2024-05-01T21:05:55.809Z',
        inDiet: true,
      })
      .expect(201)

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = listMealsResponse.body.meals[0].id

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Ref 1',
        description: 'A melhor do mundo',
        meal_datetime: 1714597555809,
        in_diet: 1,
      }),
    )
  })

  it('should be able to get the metrics', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Jhon Doe',
      email: 'jhondoe@example.com',
    })

    const cookies = createUserResponse.get('Set-cookie')!

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Ref 1',
        description: 'A melhor do mundo',
        mealDatetime: '2024-05-01T21:05:55.809Z',
        inDiet: true,
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Ref 2',
        description: 'A melhor do mundo',
        mealDatetime: '2024-05-01T21:05:55.809Z',
        inDiet: false,
      })
      .expect(201)

    const metricsResponse = await request(app.server)
      .get('/meals/metrics')
      .set('Cookie', cookies)
      .expect(200)

    expect(metricsResponse.body).toEqual(
      expect.objectContaining({
        totalMeals: 2,
        totalMealsOnDiet: 1,
        totalMealsOffDiet: 1,
        bestOnDietSequence: 1,
      }),
    )
  })

  it('should be able to create a new meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Jhon Doe',
      email: 'jhondoe@example.com',
    })

    const cookies = createUserResponse.get('Set-cookie')!

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Ref 1',
        description: 'A melhor do mundo',
        mealDatetime: '2024-05-01T21:05:55.809Z',
        inDiet: true,
      })
      .expect(201)
  })

  it('should be able to update a meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Jhon Doe',
      email: 'jhondoe@example.com',
    })

    const cookies = createUserResponse.get('Set-cookie')!

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Ref 1',
        description: 'A melhor do mundo',
        mealDatetime: '2024-05-01T21:05:55.809Z',
        inDiet: true,
      })
      .expect(201)

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = listMealsResponse.body.meals[0].id

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .send({
        name: 'Ref 2',
        description: 'A melhor do mundo',
        mealDatetime: '2024-05-01T21:05:55.809Z',
        inDiet: false,
      })
      .expect(204)

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Ref 2',
        description: 'A melhor do mundo',
        meal_datetime: 1714597555809,
        in_diet: 0,
      }),
    )
  })

  it('should be able to delete a meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Jhon Doe',
      email: 'jhondoe@example.com',
    })

    const cookies = createUserResponse.get('Set-cookie')!

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Ref 1',
        description: 'A melhor do mundo',
        mealDatetime: '2024-05-01T21:05:55.809Z',
        inDiet: true,
      })
      .expect(201)

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = listMealsResponse.body.meals[0].id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(204)

    const listMealsRetryResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    expect(listMealsRetryResponse.body.meals).toEqual(
      expect.objectContaining([]),
    )
  })
})
