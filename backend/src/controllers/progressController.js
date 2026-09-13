const { supabase } = require('../config/supabase');

/**
 * Controller for tracking problem practice, notes, and revision status
 */
const progressController = {
  /**
   * GET /api/progress
   * Fetch all progress records or filter by problem_id or status
   */
  async getProgress(req, res, next) {
    try {
      const { problem_id, status } = req.query;

      let query = supabase
        .from('user_progress')
        .select(`
          *,
          problems:problem_id (
            id,
            title,
            difficulty,
            category,
            leetcode_url
          )
        `)
        .order('updated_at', { ascending: false });

      if (problem_id) {
        query = query.eq('problem_id', problem_id);
      }
      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        if (
          error.code === 'PGRST204' ||
          error.code === 'PGRST205' ||
          error.code === '42P01' ||
          (error.message && error.message.includes('schema cache'))
        ) {
          return res.status(200).json({
            success: true,
            data: [],
            notice: 'The "user_progress" table has not been created in Supabase yet. Please execute the SQL in backend/schema.sql in your Supabase SQL editor.',
          });
        }
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
   * POST /api/progress
   * Upsert progress record for a problem
   */
  async updateProgress(req, res, next) {
    try {
      const { problem_id, status, notes, solution_code, confidence_rating, next_review_at } = req.body;

      if (!problem_id) {
        return res.status(400).json({ success: false, error: 'problem_id is required.' });
      }

      const progressData = {
        problem_id,
        status: status || 'Solving',
        notes: notes || null,
        solution_code: solution_code || null,
        confidence_rating: confidence_rating || 3,
        last_practiced_at: new Date().toISOString(),
        next_review_at: next_review_at || null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('user_progress')
        .upsert([progressData], { onConflict: 'problem_id' })
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
            error: 'The "user_progress" table does not exist in Supabase yet. Please execute backend/schema.sql in your Supabase SQL editor.',
          });
        }
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
   * DELETE /api/progress/:id
   * Remove a progress entry
   */
  async deleteProgress(req, res, next) {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('user_progress')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      res.status(200).json({
        success: true,
        message: 'Progress entry removed.',
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = progressController;
