import { PostCommentDomainModel, PostDomainModel, PostLikeOwnerDomainModel, PostOwnerDomainModel } from './../../domain/models'
import { PostCommentDto, PostDto, PostOwnerDto } from '../dtos'
import { mapPostCommentFromDtoToDomainModel, mapPostFromDtoToDomainModel, mapPostOwnerFromDomainModelToDto, mapOwnerFromDtoToDomainModel } from '../mappers'
import { mongodb } from '../orm'

export const postFactory = (owner: PostOwnerDto, body: string): PostDto => ({
  body,
  owner,
  comments: [],
  likes: []
})

export const postCommentFactory = (owner: PostOwnerDto, body: string): PostCommentDto => ({
  body,
  owner
})

export const createPost = async (owner: PostOwnerDomainModel, body: string): Promise<PostDomainModel | null> =>
  mapPostFromDtoToDomainModel(await mongodb.requests.post.create(postFactory(mapPostOwnerFromDomainModelToDto(owner), body)))

export const createPostComment = async (postId: string, body: string, owner: PostOwnerDomainModel) =>
  mapPostFromDtoToDomainModel(await mongodb.requests.post.createComment(postId, postCommentFactory(mapPostOwnerFromDomainModelToDto(owner), body)))

export const getPosts = async (): Promise<PostDomainModel[] | null> => {
  const persistedPosts = await mongodb.requests.post.getAll()
  return persistedPosts ? persistedPosts.map((post) => mapPostFromDtoToDomainModel(post) as PostDomainModel) : null
}

export const getPostById = async (postId: string): Promise<PostDomainModel | null> => {
  const persistedPost = await mongodb.requests.post.getById(postId)
  return persistedPost ? mapPostFromDtoToDomainModel(persistedPost) as PostDomainModel : null
}

export const getPostComment = async (postId: string, commentId: string): Promise<PostCommentDomainModel | null> => {
  const persistedComment = await mongodb.requests.post.getComment(postId, commentId)
  return persistedComment ? mapPostCommentFromDtoToDomainModel(persistedComment) as PostCommentDomainModel : null
}

export const getPostLikeByOwnerId = async (postId: string, ownerId: string): Promise<PostLikeOwnerDomainModel | null> => {
  const persistedLike = await mongodb.requests.post.getLikeByOwnerId(postId, ownerId)
  return persistedLike ? mapOwnerFromDtoToDomainModel(persistedLike) as PostLikeOwnerDomainModel : null
}

export const deletePostComment = async (postId: string, commentId: string): Promise<void> =>
  mongodb.requests.post.deleteComment(postId, commentId)

export const likePost = async (postId: string, owner: PostLikeOwnerDomainModel): Promise<PostDomainModel | null> =>
  mapPostFromDtoToDomainModel(await mongodb.requests.post.like(postId, mapPostOwnerFromDomainModelToDto(owner)))

export const dislikePost = async (postId: string, userId: string): Promise<void> =>
  mongodb.requests.post.dislike(postId, userId)
