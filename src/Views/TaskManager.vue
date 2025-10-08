<script setup>
import { ref, onMounted, computed } from 'vue'
import { useTaskStore } from '@/stores/useTaskStore'
import { toast } from 'vue3-toastify'

const taskStore = useTaskStore()

const todayDate = new Date().toISOString().split('T')[0]

const isValid = computed(() => newTask.value.nom.trim() !== '')

const formatDate = (date) => {
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR')
}

const isToday = (deadline) => {
  const d = typeof deadline === 'string' ? deadline : deadline.toISOString().split('T')[0]
  return d === todayDate
}

const emptyTask = () => ({
  nom: '',
  description: '',
  status: 'en cours',
  importance: 'Urgent',
  deadline: undefined,
})

const newTask = ref(emptyTask())
const editingTask = ref(null)

const handleAddTask = async () => {
  if (!newTask.value.nom) return
  await taskStore.addTask({ ...newTask.value })
  newTask.value = emptyTask()
}

const editTask = (task) => {
  editingTask.value = { ...task }
  toast.info('Modification de la tâche')
}

const saveEdit = async () => {
  if (!editingTask.value || editingTask.value.id == null) return
  await taskStore.updateTask(editingTask.value.id, editingTask.value)
  editingTask.value = null
  toast.success('Tâche mise à jour avec succès')
}

const cancelEdit = () => {
  editingTask.value = null
  toast.warn('Modification annulée')
}

onMounted(() => {
  taskStore.fetchTasks()
})

const getBackgroundImportance = (t) => {
  if (t.status === 'terminée') return { backgroundColor: 'lightgreen' }
  return t.importance === 'Urgent'
    ? { backgroundColor: 'rgb(246 142 142)' }
    : { backgroundColor: 'rgb(255 225 235)' }
}
</script>

<template>
  <div class="task-manager">
    <h2>❤️ Les tâches de Fiona ❤️</h2>

    <form @submit.prevent="handleAddTask" class="task-form">
      <input v-model="newTask.nom" placeholder="Nom de la tâche" required />
      <textarea v-model="newTask.description" placeholder="Description"></textarea>
      <select v-model="newTask.status">
        <option>en cours</option>
        <option>terminée</option>
      </select>
      <select v-model="newTask.importance">
        <option>Peu important</option>
        <option>Urgent</option>
      </select>
      <input v-model="newTask.deadline" type="date" />
    </form>
    <button type="submit" id="submit" :disabled="!isValid" @click="handleAddTask">Ajouter</button>

    <div class="task-list">
      <div
        v-for="task in taskStore.tasks"
        :key="task.id"
        class="task-card"
        :style="getBackgroundImportance(task)"
      >
        <h3 :class="[task.status === 'terminée' ? 'taskDone' : '']">{{ task.nom }}</h3>
        <p>{{ task.description }}</p>
        <p class="status">Importance : {{ task.importance === 'Urgent' ? '🔥' : '💤' }}</p>
        <p class="status">Statut : {{ task.status }}</p>
        <p
          v-if="task.deadline"
          class="deadline"
          :class="[isToday(task.deadline) ? 'is-today-date' : '']"
        >
          Deadline : {{ formatDate(task.deadline) }}
          <span v-if="isToday(task.deadline)">
            - Attention ma vie c'est pour aujourd'hui ! 😱
          </span>
        </p>

        <div class="actions">
          <button @click="editTask(task)" style="background-color: yellow;">✏️ Modifier</button>
          <button @click="taskStore.deleteTask(task.id)" style="background-color: red;">🗑️ Supprimer</button>
        </div>
      </div>
    </div>

    <div v-if="editingTask" class="edit-modal">
      <h3>Modifier la tâche</h3>
      <input v-model="editingTask.nom" />
      <textarea v-model="editingTask.description" />
      <select v-model="editingTask.status">
        <option>en cours</option>
        <option>terminée</option>
      </select>
      <select v-model="editingTask.importance">
        <option>Peu important</option>
        <option>Urgent</option>
      </select>
      <input v-model="editingTask.deadline" type="date" />
      <button @click="saveEdit">Enregistrer</button>
      <button @click="cancelEdit">Annuler</button>
    </div>
  </div>
</template>
