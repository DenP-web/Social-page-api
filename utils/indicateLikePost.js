const indicateLike = (posts = [], userId = '') => {
  return posts.map((post) => ({
    ...post,
    likedByUser: post.likes.some((like) => like.userId === userId),
  }));
};

module.exports = { indicateLike };
