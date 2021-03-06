import { mongodb } from '../../../../infrastructure/orm'
import { userDataSource } from '../../../../infrastructure/dataSources'
import { UpdatingUserError } from '../../../errors'
import { NewUserProfileDomainModel, UserProfileDomainModel } from '../../../models'
import { testingUsers, testingAvatarUrls, cleanUsersCollection, saveUser, getUserByUsername } from './../../../../test/fixtures'

import { updateUserProfile } from '../../user.services'

const { username, password, email, avatar, name, surname, token } = testingUsers[0]

describe('[SERVICES] User - updateUserProfile', () => {
  const { connect, disconnect } = mongodb

  const mockedUserData = {
    username,
    password,
    email,
    avatar,
    name,
    surname,
    token
  }

  beforeAll(async () => {
    await connect()
  })

  beforeEach(async () => {
    await cleanUsersCollection()
    await saveUser(mockedUserData)
  })

  afterAll(async () => {
    await cleanUsersCollection()
    await disconnect()
  })

  it('must update the user\'s profile and return the final result', async (done) => {
    const originalUser = await getUserByUsername(username)

    expect(originalUser.name).toBe(mockedUserData.name)
    expect(originalUser.surname).toBe(mockedUserData.surname)
    expect(originalUser.avatar).toBe(mockedUserData.avatar)

    const { _id: userId } = originalUser
    const newProfileData: NewUserProfileDomainModel = {
      name: 'Jane',
      surname: 'Doe',
      avatar: testingAvatarUrls[1]
    }

    const updatedProfile = await updateUserProfile(userId, newProfileData) as UserProfileDomainModel

    expect(updatedProfile.username).toBe(originalUser.username)
    expect(updatedProfile.email).toBe(originalUser.email)

    expect(updatedProfile.name).toBe(newProfileData.name)
    expect(updatedProfile.surname).toBe(newProfileData.surname)
    expect(updatedProfile.avatar).toBe(newProfileData.avatar)

    done()
  })

  it('must throw an INTERNAL_SERVER_ERROR (500) when the datasource throws an unexpected error', async (done) => {
    jest.spyOn(userDataSource, 'updateUserProfileById').mockImplementation(() => {
      throw new Error('Testing error')
    })

    const { _id: userId } = await getUserByUsername(username)
    const newProfileData: NewUserProfileDomainModel = {
      name: 'Jane',
      surname: 'Doe',
      avatar: testingAvatarUrls[1]
    }

    try {
      await updateUserProfile(userId, newProfileData)
    } catch (error) {
      expect(error).toStrictEqual(new UpdatingUserError(`Error updating user '${userId}' profile. ${error.message}`))
    }

    jest.spyOn(userDataSource, 'updateUserProfileById').mockRestore()

    done()
  })
})
