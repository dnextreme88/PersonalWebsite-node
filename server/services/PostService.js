const db = require('../models');

const hideAttributes = ['password'];

class PostService {
    constructor(log) {
        this.log = log;
    }

    async getAll() {
        const posts = await db.Post.findAll({
            include: [
                {
                    model: await db.Category,
                    as: 'category',
                },
                {
                    model: await db.User,
                    as: 'user',
                    attributes: { exclude: hideAttributes },
                },
            ],
            order: [['createdAt', 'ASC']],
        });

        return posts;
    }

    async getAllByCategory(categoryId) {
        const posts = await db.Post.findAll({
            where: { categoryId },
            include: [
                {
                    model: await db.Category,
                    as: 'category',
                },
                {
                    model: await db.User,
                    as: 'user',
                    attributes: { exclude: hideAttributes },
                },
            ],
            order: [['createdAt', 'ASC']],
        });

        return posts;
    }

    async getAllByUser(userId) {
        const posts = await db.Post.findAll({
            where: { userId },
            include: [
                {
                    model: await db.Category,
                    as: 'category',
                },
                {
                    model: await db.User,
                    as: 'user',
                    attributes: { exclude: hideAttributes },
                },
            ],
            order: [['createdAt', 'ASC']],
        });

        return posts;
    }

    async getById(id) {
        const post = await db.Post.findByPk(id, {
            include: [
                {
                    model: await db.Category,
                    as: 'category',
                },
                {
                    model: await db.User,
                    as: 'user',
                    attributes: { exclude: hideAttributes },
                },
            ],
        });

        return post;
    }

    async createPost(body) {
        const values = {
            title: body.title,
            slug: '', // Slug is automatically set under server/models/Post.js
            content: body.content,
            categoryId: body.categoryId,
            userId: body.userId,
        };
        const newPost = await db.Post.create(values);

        return newPost;
    }

    async updatePost(id, body) {
        const post = await db.Post.findByPk(id);
        const values = {
            title: body.title ? body.title : post.title,
            slug: '', // Slug is automatically set under server/models/Post.js
            content: body.content ? body.content : post.content,
            categoryId: body.categoryId ? body.categoryId : post.categoryId,
            userId: body.userId ? body.userId : post.userId,
        };
        const updatedPost = await db.Post.update(values, {
            where: { id },
            returning: true,
            plain: true,
        });

        return updatedPost[1].dataValues;
    }

    async deletePost(id) {
        await db.Post.destroy({
            where: { id },
        });

        return 'Post deleted';
    }
}

module.exports = PostService;
