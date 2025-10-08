import { defineStore } from 'pinia'
import { supabase } from '../../supabaseClient'
import { toast } from 'vue3-toastify'

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [],
  }),

  actions: {
    async fetchTasks() {
      const { data, error } = await supabase
        .from('task')
        .select('*')
        .order('importance', { ascending: false })

      if (!error && data) {
        this.tasks = data
      } else {
        toast.error("Erreur lors du chargement des tâches")
      }
    },

    async addTask(newTask) {
      const { data, error } = await supabase
        .from('task')
        .insert(newTask)
        .select()

      if (!error && data && data.length > 0) {
        this.tasks.unshift(data[0])
        toast.success('Tâche ajoutée avec succès')
      } else {
        toast.error('Erreur lors de l’ajout de la tâche')
      }
    },

    async updateTask(id, updatedTask) {
      const { data, error } = await supabase
        .from('task')
        .update(updatedTask)
        .eq('id', id)
        .select()

      if (!error && data && data.length > 0) {
        const index = this.tasks.findIndex((task) => task.id === id)
        if (index !== -1) {
          this.tasks.splice(index, 1, data[0])
          toast.success('Tâche mise à jour avec succès')
        }
      } else {
        toast.error('Erreur lors de la mise à jour')
      }
    },

    async deleteTask(id) {
      const { error } = await supabase
        .from('task')
        .delete()
        .eq('id', id)

      if (!error) {
        this.tasks = this.tasks.filter((task) => task.id !== id)
        toast.success('Tâche supprimée avec succès')
      } else {
        toast.error('Erreur lors de la suppression')
      }
    },
  },
})
