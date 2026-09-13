const { supabase } = require('../config/supabase');

/**
 * Controller for LeetCode Problems management
 */
const problemController = {
  /**
   * GET /api/problems
   * Fetch all problems with optional filters (difficulty, category, search)
   */
  async getAllProblems(req, res, next) {
    try {
      const { difficulty, category, search, limit = 50, offset = 0 } = req.query;

      let query = supabase
        .from('problems')
        .select('*', { count: 'exact' })
        .range(Number(offset), Number(offset) + Number(limit) - 1)
        .order('created_at', { ascending: false });

      if (difficulty) {
        query = query.eq('difficulty', difficulty);
      }
      if (category) {
        query = query.ilike('category', `%${category}%`);
      }
      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        // If the table doesn't exist yet in Supabase, return a descriptive guidance notice
        if (
          error.code === 'PGRST204' ||
          error.code === 'PGRST205' ||
          error.code === '42P01' ||
          (error.message && error.message.includes('schema cache'))
        ) {
          return res.status(200).json({
            success: true,
            data: [],
            count: 0,
            notice: 'The "problems" table has not been created in Supabase yet. Please execute the SQL in backend/schema.sql in your Supabase SQL editor.',
          });
        }
        return res.status(400).json({ success: false, error: error.message });
      }

      res.status(200).json({
        success: true,
        data,
        total: count,
        limit: Number(limit),
        offset: Number(offset),
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/problems/:id
   * Fetch a single problem by ID
   */
  async getProblemById(req, res, next) {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return res.status(404).json({ success: false, error: error.message });
      }

      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/problems
   * Create a new LeetCode problem
   */
  async createProblem(req, res, next) {
    try {
      const { title, difficulty, category, leetcode_url, description } = req.body;

      if (!title) {
        return res.status(400).json({ success: false, error: 'Problem title is required.' });
      }

      const newProblem = {
        title,
        difficulty: difficulty || 'Medium',
        category: category || 'General',
        leetcode_url: leetcode_url || null,
        description: description || null,
      };

      const { data, error } = await supabase
        .from('problems')
        .insert([newProblem])
        .select()
        .single();

      if (error) {
        if (
          error.code === 'PGRST204' ||
          error.code === 'PGRST205' ||
          error.code === '42P01' ||
          (error.message && error.message.includes('schema cache'))
        ) {
          return res.status(400).json({
            success: false,
            error: 'The "problems" table does not exist in Supabase yet. Please execute backend/schema.sql in your Supabase SQL editor.',
          });
        }
        return res.status(400).json({ success: false, error: error.message });
      }

      res.status(201).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/problems/:id
   * Update an existing problem
   */
  async updateProblem(req, res, next) {
    try {
      const { id } = req.params;
      const { title, difficulty, category, leetcode_url, description } = req.body;

      const updates = {};
      if (title !== undefined) updates.title = title;
      if (difficulty !== undefined) updates.difficulty = difficulty;
      if (category !== undefined) updates.category = category;
      if (leetcode_url !== undefined) updates.leetcode_url = leetcode_url;
      if (description !== undefined) updates.description = description;

      const { data, error } = await supabase
        .from('problems')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/problems/:id
   * Delete a problem by ID
   */
  async deleteProblem(req, res, next) {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('problems')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      res.status(200).json({
        success: true,
        message: 'Problem deleted successfully.',
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = problemController;
